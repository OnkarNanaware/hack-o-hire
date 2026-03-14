<div align="center">

# 🛡️ FraudSentinel

### AI-Powered Multi-Modal Fraud Detection Platform

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**A unified, AI-native fraud detection framework capable of identifying generative AI-based attacks across 7 distinct attack surfaces — with a single risk score output from 0 to 100.**

[View Architecture](#-system-architecture) · [Modules](#-detection-modules) · [Datasets](#-datasets) · [Tech Stack](#-tech-stack) · [UI Overview](#-ui-overview) · [Installation](#-installation)

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Problem Statement](#-problem-statement)
3. [System Architecture](#-system-architecture)
4. [Detection Modules](#-detection-modules)
5. [Model Pipelines](#-model-pipelines)
6. [Risk Scoring Engine](#-risk-scoring-engine)
7. [Datasets](#-datasets)
8. [Tech Stack](#-tech-stack)
9. [UI Overview](#-ui-overview)
10. [Repository Structure](#-repository-structure)
11. [Installation](#-installation)
12. [API Reference](#-api-reference)
13. [Deployment](#-deployment)
14. [Future Enhancements](#-future-enhancements)
15. [Contributing](#-contributing)
16. [Contributors](#-contributors)

---

## 🌐 Project Overview

**FraudSentinel** is a production-ready, open-source AI fraud detection platform built for the era of generative AI threats. Unlike traditional signature-based fraud detection systems, FraudSentinel is designed from the ground up to detect **AI-crafted, AI-assisted, and AI-impersonated fraud** across the full spectrum of enterprise attack surfaces.

The platform ingests diverse input modalities — **emails, file attachments, URLs, audio recordings, text prompts, and code payloads** — runs them through specialized AI detection modules, and aggregates all signals into a single **unified risk score (0–100)** with an automated security action recommendation.

### Key Differentiators

| Feature | Traditional Fraud Tools | FraudSentinel |
|---|---|---|
| Input modalities | Single (usually email) | 7 attack surfaces |
| Detection approach | Signature / rule-based | ML + Transformer AI |
| AI-generated fraud detection | ❌ | ✅ |
| Unified risk score | ❌ | ✅ 0–100 |
| Explainability (XAI) | ❌ | ✅ SHAP + LIME |
| Sandboxed agent testing | ❌ | ✅ Docker seccomp |
| Real-time dashboard | Basic | Full cybersecurity UI |

---

## 🎯 Problem Statement

Generative AI has dramatically lowered the barrier for sophisticated cyberattacks:

- **LLM-crafted phishing emails** that perfectly mimic executive writing styles, bypassing traditional spam filters
- **Deepfake voice synthesis** enabling vishing (voice phishing) attacks that impersonate CEOs and bypass phone-based 2FA
- **AI-generated website clones** that are visually indistinguishable from legitimate banking portals
- **Prompt injection attacks** that hijack AI agents to exfiltrate data or bypass security controls
- **AI malware generation** that mutates payloads to avoid signature detection

Existing fraud detection systems were not designed to handle AI-generated threats at scale. FraudSentinel closes this gap with a specialized, multi-modal AI detection framework.

---

## 🏗️ System Architecture

```
╔════════════════════════════════════════════════════════════╗
║                    Input Sources                           ║
║   📧 Email  📎 File  🌐 URL  🎙️ Voice  💬 Prompt  🤖 Agent ║
╚════════════════════════╤═══════════════════════════════════╝
                         │
                         ▼
              ┌──────────────────────┐
              │   FastAPI Gateway    │
              │  Auth · Rate Limit   │
              └──────────┬───────────┘
                         │  (parallel dispatch)
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ Email    │    │Credential│    │Attachment│
  │ Phishing │    │  Leak    │    │ Scanner  │
  └──────────┘    └──────────┘    └──────────┘
  ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ Website  │    │ Deepfake │    │ Prompt   │
  │ Spoofing │    │  Voice   │    │Injection │
  └──────────┘    └──────────┘    └──────────┘
                  ┌──────────┐
                  │  Agent   │
                  │ Sandbox  │
                  └────┬─────┘
                       │
          ┌────────────▼────────────┐
          │     Risk Scoring Engine  │
          │  Weighted Aggregation    │
          │  Score: 0–100 · Tier     │
          └────────────┬─────────────┘
                       │
          ┌────────────▼─────────────┐
          │    Security Actions       │
          │ 🔴 Block  🟠 Quarantine   │
          │ 🟡 Alert  🟢 Monitor      │
          └────────────┬─────────────┘
                       │
          ┌────────────▼─────────────┐
          │  React Dashboard + Logs  │
          └──────────────────────────┘
```

See [docs/architecture.md](docs/architecture.md) for full ASCII diagrams and deployment topologies.

---

## 🔍 Detection Modules

### 1. 📧 AI Phishing Email Detector
Detects AI-crafted spear phishing emails using BERT transformer NLP combined with header forensics and URL reputation analysis.

**Key techniques**: Header spoofing detection · SPF/DMARC/DKIM validation · URL entropy scoring · Fine-tuned BERT classifier · PhishTank reputation lookup

---

### 2. 🔑 Credential Leakage Scanner
Scans documents, codebases, and text content for accidentally exposed secrets, API keys, and PII.

**Key techniques**: TruffleHog regex engine (700+ patterns) · High-entropy string detection · spaCy NER for PII extraction · Context-aware false positive reduction

---

### 3. 📎 Malicious Attachment Analyzer
Multi-format static analysis engine for detecting malware in uploaded files without execution.

**Key techniques**: Magic-byte file type detection · YARA rule matching (7000+ signatures) · PDF stream analysis · Office macro extraction · PE header ML classifier · MalwareBazaar hash lookup

---

### 4. 🌐 Website Spoofing Detector
Identifies visual clones and lookalike domains through combined URL analysis, WHOIS checks, and CNN-based visual fingerprinting.

**Key techniques**: Playwright screenshot capture · CNN visual similarity (top-1000 brand fingerprints) · Domain edit-distance analysis · Punycode/homoglyph detection · TLS certificate validation

---

### 5. 🎙️ Deepfake Voice Detector
Anti-spoofing audio classifier distinguishing real human voices from AI-synthesized speech.

**Key techniques**: MFCC feature extraction (40 coefficients + derivatives) · SVM anti-spoofing classifier · Fine-tuned Wav2Vec2 deep features · Ensemble confidence scoring

---

### 6. 💬 Prompt Injection Guard
Multi-layer detection system for identifying adversarial prompts targeting LLM-based AI systems.

**Key techniques**: Pattern-based rule engine (fast path) · BERT semantic classifier · Llama Guard safety evaluation · Structural token analysis · Obfuscation pattern detection (base64, rot13, multilingual)

---

### 7. 🤖 AI Agent Vulnerability Sandbox
Isolated execution environment for safely testing AI agent behavior and detecting malicious side effects.

**Key techniques**: Docker container with seccomp/AppArmor · strace syscall monitoring · Filesystem access tracking · Subprocess spawn detection · Behavioral pattern matching

---

## ⚙️ Model Pipelines

All modules implement a 6-stage `BasePipeline`:

```
Stage 1: Input Validation & Sanitization
Stage 2: Feature Extraction (domain-specific)
Stage 3: Model Inference (ML / Transformer)
Stage 4: Score Normalization (→ 0.0–1.0)
Stage 5: Explainability (SHAP / LIME)
Stage 6: ModuleResult Assembly
```

See [docs/model_pipelines.md](docs/model_pipelines.md) for detailed per-module pipeline diagrams.

---

## 🎯 Risk Scoring Engine

The Risk Engine aggregates all module scores into a unified **0–100 risk score**:

```
Unified Score = Σ (module_score_i × weight_i) / Σ weight_i × 100
```

**Default weights** (configurable via `configs/risk_weights.yaml`):

| Module | Weight |
|---|---|
| Email Phishing | 20% |
| Malicious Attachment | 20% |
| Credential Leak | 15% |
| Website Spoofing | 15% |
| Deepfake Voice | 10% |
| Prompt Injection | 10% |
| Agent Sandbox | 10% |

**Risk Tiers:**

| Score | Tier | Action |
|---|---|---|
| 0–20 | 🟢 **Safe** | Monitor |
| 21–50 | 🟡 **Suspicious** | Alert |
| 51–75 | 🟠 **High Risk** | Quarantine |
| 76–100 | 🔴 **Critical** | Block |

---

## 📊 Datasets

| Module | Datasets | Volume |
|---|---|---|
| Email Phishing | Enron, Nazario, CEAS Spam | ~600K emails |
| Website Spoofing | PhishTank, PhiUSIIL | 1M+ URLs |
| Deepfake Voice | ASVspoof 2019/2021, FoR | 765K+ clips |
| Prompt Injection | deepset/prompt-injections, BIPIA, Synthetic | ~15K prompts |
| Malware Attach. | MalwareBazaar, VirusShare, theZoo | 1M+ samples |
| Credential Leak | TruffleHog patterns, spaCy NER | 700+ regex rules |

See [datasets/README.md](datasets/README.md) for full dataset documentation including sources, formats, licenses, and download instructions.

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|---|---|
| API Framework | FastAPI + Uvicorn |
| Language | Python 3.11+ |
| Async | asyncio + httpx |
| ORM | SQLAlchemy 2.0 + Alembic |
| Database | PostgreSQL / SQLite |
| Cache | Redis |
| Task Queue | Celery (optional) |

### Machine Learning
| Domain | Libraries |
|---|---|
| Deep Learning | PyTorch 2.2 |
| Transformers | HuggingFace Transformers 4.38 |
| Classical ML | scikit-learn 1.4 |
| NLP | spaCy 3.7 |
| Audio | librosa, soundfile |
| Explainability | SHAP, LIME |

### Security & Sandboxing
| Purpose | Tool |
|---|---|
| Secret Detection | TruffleHog v3 |
| YARA Rules | yara-python |
| Browser Automation | Playwright |
| WHOIS Lookup | python-whois |
| Sandboxing | Docker + seccomp + AppArmor |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP Client | Axios |
| Routing | React Router v6 |

---

## 🖥️ UI Overview

FraudSentinel ships with a dark-themed cybersecurity dashboard with the following pages:

| Page | Path | Description |
|---|---|---|
| **Dashboard** | `/` | Command center: KPIs, risk trends, module activity, alert feed |
| **Email Scanner** | `/email` | Upload/paste email + phishing risk score with flag breakdown |
| **Attachment Scanner** | `/attachment` | File upload with YARA/PE analysis results |
| **Website Detector** | `/website` | URL input with domain analysis pipeline visualization |
| **Voice Detector** | `/voice` | Audio upload with real vs. synthetic confidence |
| **Prompt Injection** | `/prompt` | Prompt textarea + example attacks with injection score |
| **Agent Sandbox** | `/sandbox` | Execution logs + suspicious syscall alerts |
| **Analytics** | `/analytics` | Risk trends, attack distribution, module statistics |

**UI Components:**
- `RiskScoreCard` — Animated SVG gauge ring with tier-colored output
- `AlertTable` — Live feed of recent fraud detections with risk bars
- `UploadPanel` — Drag-and-drop file uploader with validation
- `Navbar` — Sidebar navigation with active module status indicator

---

## 📁 Repository Structure

```
fraud-sentinel/
│
├── backend/
│   ├── api/                    # FastAPI routes, middleware, schemas
│   ├── modules/
│   │   ├── phishing_email/     # Email phishing detection module
│   │   ├── credential_leak/    # Credential leak scanner
│   │   ├── malicious_attachment/ # Attachment analyzer
│   │   ├── website_spoofing/   # Website spoof detector
│   │   ├── deepfake_voice/     # Voice deepfake detector
│   │   ├── prompt_injection/   # Prompt injection guard
│   │   └── agent_sandbox/      # AI agent sandbox
│   ├── models/                 # Trained model weights + registry
│   ├── pipelines/              # Pipeline orchestration per module
│   ├── risk_engine/            # Score aggregation + action mapping
│   ├── sandbox/                # Docker executor + behavior analyzer
│   └── utils/                  # Shared utilities
│
├── frontend/
│   └── src/
│       ├── components/         # Navbar, RiskScoreCard, UploadPanel, AlertTable
│       ├── pages/              # Dashboard, EmailScanner, VoiceDetector, etc.
│       ├── services/           # api.ts — typed API client
│       ├── hooks/              # Custom React hooks
│       └── styles/             # globals.css design system
│
├── datasets/                   # Dataset documentation + download scripts
├── configs/                    # app_config.yaml, model_config.yaml, risk_weights.yaml
├── notebooks/                  # Jupyter notebooks for model training & EDA
├── scripts/                    # Data prep, model export, deployment scripts
├── docker/                     # Dockerfiles, docker-compose.yml, nginx.conf
├── docs/                       # architecture.md, model_pipelines.md, api_reference.md
├── requirements.txt            # Python dependencies
└── README.md
```

---

## 🚀 Installation

> **Prerequisites**: Python 3.11+, Node.js 20+, Docker (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/fraud-sentinel.git
cd fraud-sentinel
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers (for website scanner)
playwright install chromium

# Copy environment config
cp .env.example .env
# Edit .env with your DATABASE_URL, REDIS_URL, etc.

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn backend.api.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# → Open http://localhost:3000
```

### 4. Docker (Full Stack)

```bash
cd docker
docker-compose up --build
# → API: http://localhost:8000
# → UI:  http://localhost:3000
```

---

## 📡 API Reference

All endpoints return a `ScanResult` object:

```json
{
  "scan_id": "uuid",
  "timestamp": "ISO8601",
  "unified_risk_score": 78,
  "risk_tier": "critical",
  "recommended_action": "block",
  "module_scores": [
    {
      "module_name": "phishing_email",
      "risk_score": 85,
      "confidence": 92,
      "flags": ["mismatched_reply_to", "urgency_language", "lookalike_domain"],
      "explanation": { "bert_attention": 0.62, "url_entropy": 0.18 }
    }
  ],
  "processing_time_ms": 342
}
```

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/email/scan` | Scan email for phishing |
| `POST` | `/api/attachment/scan` | Analyze file for malware |
| `POST` | `/api/website/scan` | Check URL for spoofing |
| `POST` | `/api/voice/scan` | Detect voice deepfake |
| `POST` | `/api/prompt/scan` | Analyze prompt for injection |
| `POST` | `/api/credential/scan` | Scan text for credential leaks |
| `POST` | `/api/sandbox/run` | Execute in isolated sandbox |
| `GET` | `/api/dashboard/stats` | Dashboard KPI statistics |
| `GET` | `/api/alerts` | Recent fraud alerts list |

---

## ☁️ Deployment

### Local (Development)
```bash
uvicorn backend.api.main:app --reload   # Backend
npm run dev                              # Frontend
```

### Docker Compose (Staging/Production)
```bash
docker-compose -f docker/docker-compose.yml up -d
```

### Kubernetes (Enterprise)
- Each module deployable as an independent microservice pod
- GPU nodes for voice and vision models
- Sandbox pods with privileged security context restrictions
- HPA (Horizontal Pod Autoscaler) for API tier

See [docs/deployment_guide.md](docs/deployment_guide.md) for detailed cloud deployment instructions.

---

## 🔮 Future Enhancements

- [ ] **Real-time WebSocket alerts** — Push notifications to dashboard on threat detection
- [ ] **Browser extension** — In-browser website spoofing detection
- [ ] **Email gateway integration** — Plug into SMTP relay for automated quarantine
- [ ] **Federated learning** — Privacy-preserving model updates across organizations
- [ ] **Threat intelligence feeds** — MISP, OpenCTI, STIX/TAXII integration
- [ ] **Active Directory integration** — LDAP-based access control
- [ ] **Mobile app** — iOS/Android for on-the-go fraud report submission
- [ ] **Multi-language support** — Phishing detection in 20+ languages
- [ ] **Blockchain audit log** — Immutable fraud incident ledger
- [ ] **SOAR integration** — Automated playbook execution (Splunk SOAR, PagerDuty)

---

## 🤝 Contributing

We welcome contributions from the security research and AI community!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-module-name`
3. Follow the `BasePipeline` interface for new modules
4. Add unit tests in `backend/tests/`
5. Update dataset docs if adding new training data
6. Submit a Pull Request with a clear description

Please read [docs/contributing.md](docs/contributing.md) for our full contribution guidelines.

---

## 👥 Contributors

<div align="center">

| Role | Name | Area |
|---|---|---|
| 🏗️ System Architect | — | Platform architecture & risk engine |
| 🧠 ML Engineer | — | Transformer models & pipelines |
| 🔒 Security Engineer | — | Sandbox & credential detection |
| 🎨 Frontend Engineer | — | React dashboard & UI |
| 📊 Data Engineer | — | Dataset curation & preprocessing |
| 🧪 QA Engineer | — | Testing & validation |

</div>

---

<div align="center">

**Built with ❤️ for the open-source AI security community**

[⬆ Back to Top](#-fraudsentinel)

</div>
