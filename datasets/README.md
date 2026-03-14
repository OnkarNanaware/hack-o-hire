# `/datasets`

All training, evaluation, and reference datasets for the 7 detection modules. **Raw datasets must NOT be committed to Git** — use `.gitignore` and store large files in cloud storage. Only metadata and download scripts are checked in.

---

## 1. Email Phishing Detection

| Dataset | Purpose | Records | Format | License |
|---|---|---|---|---|
| Enron Email Dataset | Legitimate email corpus for negative examples | ~500K emails | `.mbox` / `.eml` | Public Domain |
| Nazario Phishing Dataset | HTML phishing emails | ~6K emails | `.eml` | Research only |
| CEAS Spam Corpus 2008 | Spam/phishing classification baseline | ~100K emails | CSV + raw text | Research use |

- **Enron**: https://www.cs.cmu.edu/~enron/
- **Nazario**: https://monkey.org/~jose/phishing/
- **CEAS**: http://www.ceas.cc/

---

## 2. Website Phishing / Spoofing Detection

| Dataset | Purpose | Records | Format | License |
|---|---|---|---|---|
| PhishTank | Verified phishing URL database | 1M+ URLs | CSV / JSON API | CC BY-SA |
| PhiUSIIL Dataset | URL features + web content phishing dataset | ~235K sites | CSV feature vectors | Academic |
| Alexa Top 1M (historical) | Legitimate site reference for domain comparison | 1M domains | CSV | Public |

- **PhishTank**: https://phishtank.org/developer_info.php
- **PhiUSIIL**: https://archive.ics.uci.edu/dataset/967/phiusiil+phishing+url+dataset

---

## 3. Deepfake Voice Detection

| Dataset | Purpose | Records | Format | License |
|---|---|---|---|---|
| ASVspoof 2019 | Logical access and physical access anti-spoofing | 121K utterances | `.flac` 16kHz | Research |
| ASVspoof 2021 | Updated with codec/channel distortions | 533K utterances | `.flac` / `.wav` | Research |
| Fake-or-Real (FoR) | TTS-generated vs. real human voices | 111K clips | `.wav` | CC BY 4.0 |

- **ASVspoof 2019/2021**: https://www.asvspoof.org/
- **FoR Dataset**: https://bil.eecs.yorku.ca/datasets/

---

## 4. Prompt Injection Detection

| Dataset | Purpose | Records | Format | License |
|---|---|---|---|---|
| deepset/prompt-injections | Curated injection attack + benign prompts | 662 prompts | HuggingFace dataset | Apache 2.0 |
| BIPIA Benchmark | Backdoor prompt injection for AI agents | ~5K scenarios | JSON | Research |
| Synthetic Jailbreaks | GPT-4 synthesized jailbreak prompts | ~10K prompts | JSONL | Internal |

- **deepset**: https://huggingface.co/datasets/deepset/prompt-injections
- **BIPIA**: https://github.com/microsoft/BIPIA

---

## 5. Malware Attachments

| Dataset | Purpose | Records | Format | License |
|---|---|---|---|---|
| MalwareBazaar | Active malware sample repository | 1M+ samples | Binary + JSON metadata | Abuse.ch TOS |
| VirusShare | Malware sample sharing (requires invite) | 50M+ hashes | Binary files | Restricted |
| theZoo | Public malware collection for research | ~200 families | Zipped binaries | Educational |

- **MalwareBazaar**: https://bazaar.abuse.ch/
- **VirusShare**: https://virusshare.com/
- **theZoo**: https://github.com/ytisf/theZoo

---

## 6. Credential Leak Detection

| Pattern Type | Purpose | Source | Method |
|---|---|---|---|
| TruffleHog Regex DB | Pre-built patterns for 700+ services | TruffleHog v3 | Rule-based scanning |
| spaCy NER Entities | Named entity extraction (person, org, email) | spaCy `en_core_web_sm` | Statistical NER |
| Custom Regex Patterns | API keys, secrets, AWS creds | Internal | Pattern matching |

- **TruffleHog**: https://github.com/trufflesecurity/trufflehog

---

## Download Instructions

Each module directory should contain a `download.sh` script:

```bash
#!/usr/bin/env bash
# Example: datasets/deepfake_voice/download.sh
echo "Downloading ASVspoof 2019..."
# wget or gcloud storage cp commands here
```

> ⚠️ Never commit raw binaries, audio files, or email content to this repository.
