# Model Pipelines — Detailed Documentation

Each module implements the same 6-stage `BasePipeline` interface while applying domain-specific transformations.

---

## 1. AI Phishing Email Detection Pipeline

```
┌─────────────────────────────────────┐
│          Raw Input                  │
│  (.eml file or raw email string)    │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Stage 1: Email Parser              │
│  • Parse MIME structure             │
│  • Extract headers (From, Reply-To, │
│    X-Mailer, Received chain)        │
│  • Extract plain text + HTML body   │
│  • Extract all embedded URLs        │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Stage 2: Feature Extraction        │
│  • URL lexical analysis             │
│    (entropy, TLD, subdomain depth)  │
│  • Header spoofing indicators       │
│  • Domain alignment check           │
│    (From vs. Reply-To vs. Links)    │
│  • Urgency/threat language keywords │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Stage 3: Domain Reputation         │
│  • WHOIS domain age lookup          │
│  • DNS SPF / DMARC / DKIM check     │
│  • MX record alignment              │
│  • PhishTank URL reputation query   │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Stage 4: Transformer NLP Model     │
│  • Tokenize with BERT tokenizer     │
│  • Fine-tuned BERT-base-uncased     │
│    (trained on Nazario + CEAS)      │
│  • Output: phishing probability     │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Stage 5: Feature Aggregation       │
│  • Combine: NLP score + URL score   │
│    + header score + domain score    │
│  • Weighted ensemble → 0.0–1.0      │
└───────────────┬─────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│  Stage 6: Risk Score + Explanation  │
│  • SHAP values for top features     │
│  • ModuleResult assembly            │
│  → risk_score, confidence, flags    │
└─────────────────────────────────────┘
```

---

## 2. Credential Leakage Detection Pipeline

```
Raw Text / File Content
        │
        ▼
Stage 1: Text Extraction
  • PDF/Office text extraction (pdfplumber, python-docx)
  • Git diff / code file parsing
        │
        ▼
Stage 2: Regex Pattern Scanning (TruffleHog)
  • Match against 700+ credential patterns
  • AWS keys, GitHub tokens, JWTs, SSH keys, API keys
  • Entropy-based high-confidence secret detection
        │
        ▼
Stage 3: spaCy NER
  • Extract PII entities: PERSON, ORG, EMAIL, PHONE
  • Custom entity ruler for credential-like terms
        │
        ▼
Stage 4: Context Scoring
  • Is credential in active context (code vs. comment)?
  • Is it an example/placeholder or real credential?
        │
        ▼
Stage 5: Risk Score → ModuleResult
```

---

## 3. Malicious Attachment Analysis Pipeline

```
Uploaded File (binary)
        │
        ▼
Stage 1: File Type Detection (magic bytes)
  • Identify true file type regardless of extension
  • Route to appropriate sub-analyzer
        │
        ├── PDF → PDFStream Analyzer
        │         (JavaScript, embedded files, shellcode)
        │
        ├── Office → Macro Extractor
        │           (VBA, XLM, DDEAUTO detection)
        │
        ├── PE/EXE → Header Analyzer
        │           (imports, sections, suspicious strings)
        │
        └── ZIP/RAR → Recursive unpack + re-analyze
        │
        ▼
Stage 2: YARA Rule Engine
  • Match against 7000+ malware family signatures
  • Check for known packers, crypters, RATs
        │
        ▼
Stage 3: Hash Reputation Check
  • MD5/SHA256 against MalwareBazaar API
        │
        ▼
Stage 4: ML Scoring
  • PE header feature vector → clf.predict_proba()
        │
        ▼
Stage 5: Risk Score → ModuleResult
```

---

## 4. Website Spoofing Detection Pipeline

```
Target URL
        │
        ▼
Stage 1: URL Analysis
  • Lexical features: entropy, length, TLD
  • Lookalike domain (edit distance to top brands)
  • Punycode / homoglyph detection
        │
        ▼
Stage 2: WHOIS + DNS
  • Domain registration age
  • Registrar reputation
  • DNS record anomalies
        │
        ▼
Stage 3: TLS Certificate
  • Certificate validity
  • Issuer reputation
  • Subject/SAN alignment
        │
        ▼
Stage 4: Visual Screenshot Analysis (Playwright)
  • Capture full-page screenshot
  • CNN visual similarity vs. top-1000 brand fingerprints
  • Logo detection + layout structure comparison
        │
        ▼
Stage 5: Composite Score → ModuleResult
```

---

## 5. Deepfake Voice Detection Pipeline

```
Audio Input (.wav / .mp3)
        │
        ▼
Stage 1: Audio Preprocessing
  • Resample to 16kHz mono
  • Normalize amplitude
  • Silence trimming (VAD)
        │
        ▼
Stage 2: MFCC Feature Extraction
  • 40 MFCC coefficients per frame
  • Δ and ΔΔ derivatives
  • Mean/variance normalization
        │
        ▼
Stage 3: Spectral Features
  • Spectral flux, centroid, rolloff
  • Zero crossing rate
  • Chroma + mel spectrogram
        │
        ▼
Stage 4: Dual-Model Inference
  ├── SVM Classifier (fast, MFCC-based)
  └── Wav2Vec2 fine-tuned model (deep features)
        │
        ▼
Stage 5: Ensemble Confidence Score
  • Weighted average of SVM + Wav2Vec2 probabilities
  • → real_probability vs. synthetic_probability
        │
        ▼
Stage 6: Fraud Prediction → ModuleResult
```

---

## 6. Prompt Injection Detection Pipeline

```
Input Prompt (string)
        │
        ▼
Stage 1: Regex Rule Engine (fast path)
  • Detect: "ignore previous instructions"
  • Detect: role-play patterns ("you are now...")
  • Detect: delimiter escape attempts (]], -->, ///)
        │
        ▼ (if no definitive hit from rules)
        │
Stage 2: BERT Semantic Analysis
  • Tokenize with bert-base-uncased
  • Fine-tuned on deepset/prompt-injections dataset
  • Output: injection_probability (0–1)
        │
        ▼
Stage 3: Llama Guard Safety Evaluation
  • Run through Llama Guard safety categories
  • Detect policy violations: violence, exfiltration, etc.
        │
        ▼
Stage 4: Structural Token Analysis
  • Abnormal instruction nesting depth
  • Out-of-context language switching
  • Payload obfuscation patterns (base64, rot13)
        │
        ▼
Stage 5: Ensemble Risk Score → ModuleResult
```

---

## 7. Agent Sandbox Pipeline

```
Agent Prompt / Code Payload
        │
        ▼
Stage 1: Prompt Injection Pre-check
  (Re-use Prompt Injection module output)
        │
        ▼
Stage 2: Sandboxed Container Launch
  • Spin up Docker sandbox container
  • Apply seccomp strict profile
  • Disable all network access
  • Mount read-only tmpfs
        │
        ▼
Stage 3: Instrumented Execution
  • Run payload under strace monitoring
  • Capture all syscall events
  • Monitor file access patterns
  • Track subprocess spawning
        │
        ▼
Stage 4: Behavior Analysis
  • Compare syscall trace vs. known malicious patterns
  • Flag: /etc/passwd reads, shell spawning, reverse connects
  • Flag: Excessive memory allocation, CPU exhaustion
        │
        ▼
Stage 5: Container Cleanup + Risk Score → ModuleResult
```
