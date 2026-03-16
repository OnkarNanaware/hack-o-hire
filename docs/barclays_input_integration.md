# 🏦 FraudSentinel — Barclays Input Integration Map

This document explains **exactly where each type of input comes from** within the Barclays enterprise ecosystem and how it flows into the FraudSentinel Agentic AI detection pipeline.

---

## 📊 Overview: 6 Input Sources at Barclays

```
╔══════════════════════════════════════════════════════════════════╗
║              BARCLAYS ENTERPRISE INPUT SOURCES                   ║
╠════════════════╦═════════════════════╦══════════════════════════╣
║  Input Type    ║  Barclays System    ║  Integration Method      ║
╠════════════════╬═════════════════════╬══════════════════════════╣
║ 📧 Email       ║ Microsoft Outlook   ║ Graph API / EWS Webhook  ║
║                ║ Exchange Online     ║ SMTP relay (transport)   ║
╠════════════════╬═════════════════════╬══════════════════════════╣
║ 📎 Attachment  ║ Outlook + SharePoint║ Graph API file pull      ║
║                ║ DLP Scanner         ║ Content inspection hook  ║
╠════════════════╬═════════════════════╬══════════════════════════╣
║ 🎙️ Voice       ║ Cisco UCM / Teams   ║ Real-time audio stream   ║
║                ║ Call Centre         ║ Avaya / PBX webhook      ║
╠════════════════╬═════════════════════╬══════════════════════════╣
║ 💬 Prompt      ║ Copilot for M365    ║ Copilot Plugin API       ║
║                ║ Barclays AI Agents  ║ LLM Gateway proxy hook   ║
╠════════════════╬═════════════════════╬══════════════════════════╣
║ 🌐 URL/Website ║ Zscaler / Proxy     ║ ICAP protocol hook       ║
║                ║ Azure Perimeter     ║ Firewall log ingestion   ║
╠════════════════╬═════════════════════╬══════════════════════════╣
║ 🤖 AI Agent    ║ Azure OpenAI / BDA  ║ Middleware orchestration  ║
║                ║ Barclays Dev. API   ║ API call interception     ║
╚════════════════╩═════════════════════╩══════════════════════════╝
```

---

## 1. 📧 Email — Microsoft Outlook / Exchange Online

### Where it comes from
Barclays uses **Microsoft Exchange Online** (part of Microsoft 365). Every email passes through this platform before reaching an employee's inbox.

### How FraudSentinel gets it

```
Employee Inbox (Outlook)
        │
        ▼
Microsoft Exchange Online Transport Rules
        │  ← FraudSentinel registers here as a "Transport Agent"
        ▼
Exchange Web Services (EWS) Webhook ──→ POST /api/email/scan
    OR
Microsoft Graph API (polling) ──────→ GET /v1.0/me/messages → POST /api/email/scan
```

### Integration Code

```python
# backend/integrations/outlook_connector.py
import httpx

MS_GRAPH_API = "https://graph.microsoft.com/v1.0"

async def poll_new_emails(access_token: str):
    """
    Graph API polling for new emails — runs on a 30s interval.
    In production: use a Change Notification webhook for real-time delivery.
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{MS_GRAPH_API}/me/mailFolders/Inbox/messages?$filter=isRead eq false",
            headers=headers
        )
        emails = resp.json().get("value", [])
        for email in emails:
            await scan_email({
                "sender": email["from"]["emailAddress"]["address"],
                "subject": email["subject"],
                "body": email["body"]["content"],
                "headers": {}  # parsed from internetMessageHeaders
            })
```

> **Barclays Specifics:**
> - Microsoft 365 E5 tenant with Defender for Office 365 Plan 2
> - Uses **Entra ID (Azure AD)** OAuth2 for token-based authentication
> - Registered as a **Microsoft Compliant Partner App** under Barclays IT governance
> - Runs INSIDE the Barclays VNet — no external data exfiltration

---

## 2. 📎 Attachment — Outlook / SharePoint / Microsoft Purview DLP

### Where it comes from
Attachments arrive embedded within Outlook emails OR uploaded to **SharePoint/OneDrive** within the Barclays ecosystem.

### How FraudSentinel gets it

```
Email with attachment (Outlook)
        │
        ▼
Microsoft Graph API (/messages/{id}/attachments)
        │
        ▼
FraudSentinel Attachment Connector
        │
        ▼
POST /api/attachments/scan  (multipart/form-data)
        │
        ▼
AttachmentPipeline — Agentic AI (Offline)
  ├── HeuristicAgent        (file extension, magic bytes)
  ├── YaraSignatureAgent    (7000+ offline YARA rules)
  ├── BarclaysPolicyAgent   (macro restriction policy)
  └── LLMAnalyzerAgent      (local model intent reasoning)
```

> **Barclays DLP Integration:**
> Barclays uses **Microsoft Purview DLP** policies. FraudSentinel is triggered as a
> custom **DLP policy tip action** when a suspicious file is detected, sending it for
> deep analysis before allowing the user to forward or download it.

---

## 3. 🎙️ Voice — Call Centre / Microsoft Teams Phone

### Where it comes from
Barclays operates a large call centre network (customer services, fraud helplines).
Calls arrive via **Cisco Unified Communications Manager (UCM)** or **Microsoft Teams Phone**.

### How FraudSentinel gets it

```
Inbound Customer Call
        │
        ▼
PSTN / SIP Trunk → Cisco UCM / Avaya Aura / Teams Phone
        │
        ▼
Real-Time Media Tap (SIPREC protocol — RFC 7866)
        │  ← FraudSentinel registers as a Recording Server (passive tap)
        ▼
Audio Stream (PCM 16kHz mono) → Audio Buffer
        │
        ▼
POST /api/voice/scan (WAV/streaming input)
        │
        ▼
DeepfakeVoicePipeline — Offline Models
  ├── MFCC Feature Extraction (librosa — 40 coefficients)
  ├── SVM Anti-Spoofing Classifier
  └── Wav2Vec2 Deep Feature Analysis
        │
        ▼
Real-time alert sent to call centre agent's screen (Cisco Finesse overlay)
```

> **Key Barclays Systems:**
> - **SIPREC (RFC 7866)**: Passive call recording — zero latency added to live call
> - **Cisco CUBE**: Routes media fork to FraudSentinel
> - **Genesys CX / Cisco Finesse**: Displays deepfake alert as a screen overlay on the agent desktop

---

## 4. 💬 Prompt — Microsoft Copilot / Barclays AI Agents

### Where it comes from
Barclays uses **Microsoft Copilot for M365** and is building internal **AI Agents (BDA — Barclays Digital Assistant)** on Azure OpenAI. Any user interaction with these systems generates a "prompt".

### How FraudSentinel gets it

```
User types in Copilot / Barclays AI Chatbot
        │
        ▼
LLM Gateway (Azure OpenAI via Azure API Management)
        │  ← FraudSentinel hooks here as an APIM Inbound Policy
        ▼
Prompt Interceptor → POST /api/prompt/scan  (text payload)
        │
        ▼
PromptInjectionPipeline — Offline Models
  ├── Pattern Rule Engine     (fast path, < 5ms)
  ├── BERT Semantic Classifier
  ├── Llama Guard Safety Evaluator (local)
  └── LLMAnalyzerAgent            (agentic reasoning)
        │
   BLOCKED ──→ Azure APIM returns 403, incident logged to Azure Sentinel
   FLAGGED ──→ Prompt sanitised before passing to LLM
```

### Azure API Management Policy (XML)

```xml
<!-- Inserted into the Azure API Management Inbound Policy -->
<inbound>
  <send-request mode="new" response-variable-name="fraud-check"
    timeout="5" ignore-error="false">
    <set-url>https://fraudsentinel-internal/api/prompt/scan</set-url>
    <set-method>POST</set-method>
    <set-body>{"prompt": "@{context.Request.Body.As<string>()}"}</set-body>
  </send-request>
  <choose>
    <when condition="@(
      (int)((IResponse)context.Variables["fraud-check"]).StatusCode == 200 &&
      (bool)((IResponse)context.Variables["fraud-check"]).Body.As<JObject>()["is_injection"]
    )">
      <return-response>
        <set-status code="403" reason="Prompt Injection Blocked by FraudSentinel"/>
      </return-response>
    </when>
  </choose>
</inbound>
```

---

## 5. 🌐 URL / Website — Zscaler Internet Access (ZIA)

### Where it comes from
Before any Barclays employee's browser opens a URL, it passes through **Zscaler Internet Access (ZIA)** — Barclays's Zero Trust web proxy.

### How FraudSentinel gets it

```
Employee clicks link (email or browser)
        │
        ▼
Zscaler Internet Access (ZIA) Proxy
        │  ← FraudSentinel registered as an ICAP server
        ▼
ICAP Protocol (Internet Content Adaptation Protocol)
        │
        ▼
POST /api/website/scan  { "url": "https://barcIays-secure-login.com" }
        │
        ▼
WebsiteSpoofingPipeline
  ├── Domain Edit-Distance (Levenshtein lookalike detection)
  ├── WHOIS age & registrar check (python-whois, offline cache)
  ├── Punycode / Homoglyph detection
  └── Playwright screenshot + CNN visual similarity (top-1000 brands)
        │
        ▼
ICAP Response: ALLOW / BLOCK / WARN
Zscaler enforces the action at the proxy layer
```

---

## 6. 🤖 AI Agent Payload — Azure Functions / Internal Automations

### Where it comes from
Barclays internal dev teams build automated AI agents (Azure Functions, Python scripts) that interact with APIs, databases, and file systems. A compromised or prompt-injected agent is a critical attack surface.

### How FraudSentinel gets it

```
Barclays Internal AI Agent executes
        │
        ▼
Agent Runtime makes API calls / reads files / spawns processes
        │
        ▼
FraudSentinel AgentSandbox (Docker — network_mode: none)
  ├── syscall trace (strace / eBPF hooks)
  ├── Filesystem read/write monitoring
  ├── Network connections attempted
  └── Subprocess / child process spawns
        │
        ▼
POST /api/sandbox/run  (agent definition / code payload)
→ ScanResult with behavioral anomaly flags
→ Suspicious behaviour → incident raised in Azure Sentinel
```

---

## 🔄 End-to-End Barclays Data Flow

```
╔═══════════════════════════════════════════════════════════════╗
║                  BARCLAYS ENTERPRISE LAYER                    ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Outlook Email ─────┐                                         ║
║  SharePoint File ───┤                                         ║
║  Teams / Cisco Call ┼──→  FraudSentinel Agentic AI (OFFLINE) ║
║  Copilot Prompt ────┤         │                               ║
║  Zscaler URL ───────┤         ▼                               ║
║  Azure AI Agent ────┘   Multi-Agent Consensus (0-100)         ║
║                               │                               ║
║          ┌────────────────────┼──────────────────┐            ║
║          ▼                    ▼                  ▼            ║
║    Azure Sentinel       Barclays SOC        FraudSentinel     ║
║    (SIEM Audit Log)     Alert Dashboard     Block/Quarantine  ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## ✅ Offline-First Design for Barclays

| Capability | Online LLM (GPT-4o) | Barclays Offline Mode |
|---|---|---|
| Email phishing analysis | ✅ | ✅ BERT local model |
| Attachment scanning | ✅ | ✅ YARA + Heuristics |
| Voice deepfake detection | ✅ | ✅ Wav2Vec2 local |
| Prompt injection guard | ✅ | ✅ Llama Guard local |
| Agentic intent reasoning | ✅ | ✅ Phi-3 / Mistral local |
| Data sent outside VNet | ❌ Never | ✅ Air-gapped guarantee |

> All models are pre-downloaded and served from the **Barclays-managed Azure ML Model Registry**,
> never pulled from Hugging Face Hub at runtime in the production environment.

---

## 🔗 Related Documents

- [architecture.md](./architecture.md) — Full system architecture diagrams
- [model_pipelines.md](./model_pipelines.md) — Per-module ML pipeline details
- [deployment_guide.md](./deployment_guide.md) — Azure / AKS production deployment
