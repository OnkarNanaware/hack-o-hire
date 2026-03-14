# `/backend/pipelines`

Orchestration layer that chains preprocessing, feature extraction, model inference, and post-processing steps for each detection module.

## Structure

```
pipelines/
├── base_pipeline.py            # Abstract Pipeline base class
├── email_pipeline.py           # Phishing email detection pipeline
├── credential_pipeline.py      # Credential leak scanning pipeline
├── attachment_pipeline.py      # Malicious attachment pipeline
├── website_pipeline.py         # Website spoofing detection pipeline
├── voice_pipeline.py           # Deepfake voice detection pipeline
├── prompt_pipeline.py          # Prompt injection detection pipeline
└── sandbox_pipeline.py         # Agent sandbox execution pipeline
```

## Pipeline Stages (Abstract)

```
Stage 1: Input Validation & Sanitization
Stage 2: Feature Extraction (module-specific)
Stage 3: Model Inference
Stage 4: Score Normalization (0.0 – 1.0)
Stage 5: SHAP/LIME Explanation Generation
Stage 6: ModuleResult Assembly
```

## Pipeline Contracts

Each pipeline class inherits from `BasePipeline` and must implement:
- `preprocess(raw_input)` → extracted features
- `infer(features)` → raw model output
- `postprocess(raw_output)` → `ModuleResult`
- `explain(features, raw_output)` → explanation dict

Pipelines are instantiated once at startup and reused across requests (stateless inference).
