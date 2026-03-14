# Deployment Guide — Barclays Bank Production

## Deployment Environments

| Environment | Infra | Database | Cache | Queue |
|---|---|---|---|---|
| **Local Dev** | Docker Compose | SQL Server Express (container) | Redis Community | Redis Pub/Sub |
| **Staging** | AKS (non-prod cluster) | Azure SQL Flexible Server | Azure Cache for Redis (Standard) | Service Bus Standard |
| **Production** | AKS (prod cluster, UK South+West) | Azure SQL Database Business Critical | Azure Cache for Redis Enterprise | Service Bus Premium |

---

## Why NOT PostgreSQL for Barclays

| Criteria | PostgreSQL | Azure SQL Database |
|---|---|---|
| FCA Audit Compliance | Manual setup required | Built-in with Azure Policy enforcement |
| PCI-DSS TDE | Manual configuration | Native TDE, always-on |
| Always Encrypted (PII) | `pgcrypto` (manual) | Native column-level encryption |
| Barclays Azure SSO | Custom plugin | Native Entra ID integration |
| Vendor SLA | Community / EDB | 99.995% Microsoft SLA |
| UK Data Residency | Manual geo-fencing | Azure region lock (UK South + UK West) |
| Geo-redundancy | Streaming replication (manual) | Auto geo-redundant replicas |
| BCBS 239 Data Lineage | Not supported | Microsoft Purview integration |

---

## Why NOT Community Redis for Barclays

| Criteria | Redis Community | Azure Cache for Redis Enterprise |
|---|---|---|
| Data persistence | Optional, must be configured | RDB + AOF on by default |
| TLS encryption | Manual | Enforced (TLS 1.2+) |
| Network exposure | Public by default | Private endpoint only |
| Authentication | Password-based | Azure Entra ID RBAC |
| Compliance | Not certified | PCI-DSS, ISO 27001, SOC 2 |
| HA | Sentinel (manual) | Built-in zone-redundant |

---

## Production Deployment (AKS)

### Prerequisites
```
- Azure subscription (Barclays enterprise agreement)
- AKS cluster: v1.28+ (UK South region)
- Azure Container Registry (ACR): fraudsentinelacr.azurecr.io
- Azure Key Vault: fraudsentinel-kv
- Azure SQL Database (Business Critical)
- Azure Cache for Redis Enterprise
- Azure Service Bus (Premium namespace)
- Microsoft Sentinel workspace connected
```

### Step 1 — Build and Push Images
```bash
# Authenticate to ACR
az acr login --name fraudsentinelacr

# Build backend
docker build -f docker/Dockerfile.backend -t fraudsentinelacr.azurecr.io/fraud-api:1.0.0 .
docker push fraudsentinelacr.azurecr.io/fraud-api:1.0.0

# Build frontend
docker build -f docker/Dockerfile.frontend -t fraudsentinelacr.azurecr.io/fraud-frontend:1.0.0 .
docker push fraudsentinelacr.azurecr.io/fraud-frontend:1.0.0

# Build sandbox
docker build -f docker/Dockerfile.sandbox -t fraudsentinelacr.azurecr.io/fraud-sandbox:1.0.0 .
docker push fraudsentinelacr.azurecr.io/fraud-sandbox:1.0.0
```

### Step 2 — Store Secrets in Azure Key Vault
```bash
# DB connection string
az keyvault secret set \
  --vault-name fraudsentinel-kv \
  --name fraud-db-connection-string \
  --value "Server=fraudsentinel.database.windows.net;Database=fraud_db;Authentication=Active Directory Managed Identity;"

# Redis
az keyvault secret set \
  --vault-name fraudsentinel-kv \
  --name fraud-redis-connection-string \
  --value "fraudsentinel-redis.redis.cache.windows.net:6380,ssl=True,abortConnect=False"

# Service Bus
az keyvault secret set \
  --vault-name fraudsentinel-kv \
  --name fraud-servicebus-connection \
  --value "Endpoint=sb://fraudsentinel-sb.servicebus.windows.net/;..."
```

### Step 3 — AKS Deployment
```bash
# Set AKS context
az aks get-credentials --resource-group barclays-fraud-rg --name fraudsentinel-aks

# Deploy with Helm (chart in /scripts/helm/)
helm upgrade --install fraudsentinel ./scripts/helm/fraudsentinel \
  --namespace fraud-detection \
  --create-namespace \
  --set image.tag=1.0.0 \
  --set keyvault.url=https://fraudsentinel-kv.vault.azure.net \
  --set azure.tenantId=$(az account show --query tenantId -o tsv)
```

### Step 4 — Configure Network Policies
```bash
# Apply deny-all sandbox network policy
kubectl apply -f scripts/k8s/sandbox-network-policy.yaml

# Apply Barclays NSG rules
az network nsg rule create \
  --resource-group barclays-fraud-rg \
  --nsg-name fraud-nsg \
  --name AllowInternalOnly \
  --priority 100 \
  --source-address-prefixes "10.0.0.0/8" \
  --destination-port-ranges 8000 3000
```

---

## Data Residency Compliance

All resources must be in UK regions:
- **Primary**: UK South (London) — `uksouth`
- **DR/Replica**: UK West (Cardiff) — `ukwest`

This is enforced via Azure Policy at subscription level. No data can be written to non-UK regions.

---

## Audit Trail Architecture

```
Every API request
        │
        ▼
FastAPI writes audit event
        │
        ├── Azure Service Bus → "fraud-audit-trail" topic
        │
        └── Azure Log Analytics (immutable workspace)
                    │
                    ▼
            Microsoft Sentinel (SIEM)
            Barclays SOC dashboard
```

Retention: **7 years** (FCA minimum: 5 years)
Immutability: Azure Blob WORM policy on audit-evidence container

---

## Local Development (No Azure Account Required)

```bash
# SQL Server Express runs in Docker (same SQL Server engine as Azure SQL)
# This ensures SQL syntax compatibility with production
docker-compose up db redis

# Install Python deps
pip install -r requirements.txt
pip install pyodbc  # For SQL Server connection

# Run API
PYTHONDONTWRITEBYTECODE=1 uvicorn backend.api.main:app --reload

# Run frontend
cd frontend && npm run dev
```

> The dev setup uses SQL Server Express (not PostgreSQL) to ensure code is 100% compatible with Azure SQL Database in production without any dialect changes.
