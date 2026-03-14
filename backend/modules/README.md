# `/backend/modules`

Each subdirectory is a self-contained fraud detection module. Modules expose a single `analyze(payload) -> ModuleResult` interface consumed by the Risk Engine.

## Module Directory Map

| Folder | Attack Surface | Primary Technique |
|---|---|---|
| `phishing_email/` | AI Phishing Emails | Transformer NLP + URL/Header analysis |
| `credential_leak/` | Credential Leakage | TruffleHog regex + spaCy NER |
| `malicious_attachment/` | Malicious Attachments | Static analysis + YARA rules |
| `website_spoofing/` | Website Spoofing | Visual similarity + WHOIS + TLS checks |
| `deepfake_voice/` | Deepfake Voice | MFCC + SVM / CNN classifier |
| `prompt_injection/` | Prompt Injection | BERT + Llama Guard + rule engine |
| `agent_sandbox/` | AI Agent Vulnerability | Instrumented Docker sandbox + syscall monitoring |

## Module Interface Contract

Every module must implement:

```python
class ModuleResult:
    module_name: str
    risk_score: float          # 0.0 – 1.0
    confidence: float          # 0.0 – 1.0
    flags: list[str]           # human-readable red flags
    explanation: dict          # SHAP / LIME feature attributions
    raw_output: dict           # module-specific metadata
```

## Inter-Module Dependencies

Modules are stateless and communicate only through the Risk Engine. No direct module-to-module calls.
