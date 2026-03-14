# System Architecture

## High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     AI Fraud Detection Platform                               │
│                        End-to-End System Flow                                │
└──────────────────────────────────────────────────────────────────────────────┘

                        ╔═══════════════════╗
                        ║   INPUT SOURCES   ║
                        ╠═══════════════════╣
                        ║  📧 Email (.eml)  ║
                        ║  📎 File Upload   ║
                        ║  🌐 URL String    ║
                        ║  🎙️ Audio File    ║
                        ║  💬 Text Prompt   ║
                        ╚════════╤══════════╝
                                 │
                                 ▼
               ┌─────────────────────────────────┐
               │        FastAPI Gateway          │
               │   (Auth · Rate Limit · CORS)    │
               └────────────────┬────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  Pipeline    │  │  Pipeline    │  │  Pipeline    │
    │  Orchestrator│  │  Orchestrator│  │  Orchestrator│
    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐  ┌──────▼──────┐
    │ Phishing    │   │ Credential  │  │ Attachment  │
    │ Email Mod   │   │ Leak Module │  │ Analyzer    │
    └─────────────┘   └─────────────┘  └─────────────┘

    ┌─────────────┐   ┌─────────────┐  ┌─────────────┐
    │ Website     │   │ Deepfake    │  │ Prompt Inj. │
    │ Spoof Mod   │   │ Voice Mod   │  │ Guard       │
    └─────────────┘   └─────────────┘  └─────────────┘

                  ┌───────────────────────┐
                  │   Agent Sandbox Mod   │
                  │ (Docker + seccomp)    │
                  └──────────┬────────────┘
                             │
              ┌──────────────▼──────────────┐
              │       Risk Engine           │
              │  ┌─────────────────────┐   │
              │  │ Weighted Aggregator │   │
              │  │ Score: 0–100        │   │
              │  │ Tier Classification │   │
              │  │ Action Mapping      │   │
              │  └─────────────────────┘   │
              └──────────────┬─────────────┘
                             │
              ┌──────────────▼──────────────┐
              │       Security Actions       │
              │  🔴 Block   🟠 Quarantine    │
              │  🟡 Alert   🟢 Monitor       │
              └──────────────┬──────────────┘
                             │
              ┌──────────────▼──────────────┐
              │   React Dashboard + Logs    │
              │   (Real-time alerts, charts)│
              └─────────────────────────────┘
```

---

## Deployment Architecture

### Local Development

```
Developer Machine
├── Backend: uvicorn main:app --reload (port 8000)
├── Frontend: npm run dev (port 3000, proxied to :8000)
├── Database: SQLite (file-based, auto-created)
└── Cache: In-memory (no Redis needed for dev)
```

### Dockerized Production

```
docker-compose.yml orchestrates:

[fraud_frontend:3000] ──nginx proxy──▶ [fraud_api:8000]
                                              │
                              ┌───────────────┼────────────────┐
                              ▼               ▼                ▼
                         [fraud_db]      [fraud_redis]    [fraud_sandbox]
                        PostgreSQL:5432   Redis:6379      (no network)
```

### Cloud / Microservices (Future)

```
API Gateway (Kong / AWS ALB)
        │
        ├── /api/email/     → email-service (Kubernetes pod)
        ├── /api/voice/     → voice-service (GPU node)
        ├── /api/website/   → website-service
        ├── /api/prompt/    → prompt-service
        └── /api/sandbox/   → sandbox-service (isolated node pool)

Shared: PostgreSQL (AWS RDS), Redis (ElastiCache), S3 (model storage)
Monitoring: Prometheus + Grafana, ELK Stack for logs
```

---

## Data Flow

```
1. Client sends request (file / URL / text)
2. FastAPI endpoint validates payload (Pydantic schema)
3. File stored in ephemeral temp directory
4. Relevant pipeline(s) instantiated and run concurrently (asyncio)
5. Each pipeline returns a ModuleResult (score 0–1, flags, explanation)
6. Risk Engine aggregates all ModuleResults → Unified Score 0–100
7. Action Engine maps score to action (block/quarantine/alert/monitor)
8. Result persisted to DB, sent to WebSocket for real-time dashboard
9. JSON response returned to client
10. Temp files cleaned up
```

---

## Security Principles

- **Zero Trust**: Every request authenticated via API key or JWT
- **Least Privilege**: Sandbox container has CAP_DROP ALL
- **Data Minimization**: Files deleted after processing (no persistent storage of inputs)
- **Defense in Depth**: Multiple detection layers before any action
- **Explainability**: All decisions accompanied by SHAP/LIME explanations
