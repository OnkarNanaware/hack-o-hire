# `/backend/models`

Stores trained model weights, ONNX exports, and model registry configuration. Raw training data is stored in `/datasets`.

## Structure

```
models/
├── phishing_email/
│   ├── bert_phishing_v1.pt         # Fine-tuned BERT for phishing detection
│   └── url_classifier.pkl          # scikit-learn URL feature classifier
├── credential_leak/
│   └── ner_model/                  # spaCy NER model directory
├── malicious_attachment/
│   ├── yara_rules/                 # YARA rule files (.yar)
│   └── pe_classifier.pkl           # PE header ML classifier
├── website_spoofing/
│   ├── visual_similarity.onnx      # CNN for logo/layout similarity
│   └── domain_classifier.pkl       # Domain age + WHOIS heuristic model
├── deepfake_voice/
│   ├── mfcc_svm.pkl                # MFCC + SVM anti-spoofing model
│   └── wav2vec_finetune.pt         # Fine-tuned Wav2Vec2 model
├── prompt_injection/
│   ├── bert_injection_v1.pt        # BERT fine-tuned on injection datasets
│   └── llama_guard_config.json     # Llama Guard safety config
└── registry.json                   # Model version registry
```

## Model Versioning

All models follow semantic versioning (`v{major}.{minor}`). The `registry.json` file maps module names to active model paths and hashes for integrity verification.

## Notes

- Large model checkpoints **must not** be committed to Git. Use Git LFS or store in an S3/GCS bucket and reference via `registry.json`.
- ONNX exports are preferred for production inference for cross-framework compatibility.
