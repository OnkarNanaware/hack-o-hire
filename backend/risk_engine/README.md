# `/backend/risk_engine`

The central intelligence layer that aggregates individual module scores into a unified **Risk Score (0–100)** and determines the recommended security action.

## Structure

```
risk_engine/
├── aggregator.py        # Weighted score aggregation logic
├── scorer.py            # Normalizer: converts module scores to 0–100 scale
├── thresholds.py        # Risk tier thresholds and action mapping
├── explainer.py         # Consolidated LIME/SHAP explanation aggregator
└── action_engine.py     # Maps risk score to: block / quarantine / alert / monitor
```

## Scoring Formula

```
Unified Risk Score = Σ (module_risk_score_i × weight_i) / Σ weight_i × 100

Default weights (configurable via /configs/risk_weights.yaml):
  phishing_email:       0.20
  credential_leak:      0.15
  malicious_attachment: 0.20
  website_spoofing:     0.15
  deepfake_voice:       0.10
  prompt_injection:     0.10
  agent_sandbox:        0.10
```

## Risk Tiers

| Score Range | Tier | Action |
|---|---|---|
| 0–20 | 🟢 Safe | Monitor |
| 21–50 | 🟡 Suspicious | Alert |
| 51–75 | 🟠 High Risk | Quarantine |
| 76–100 | 🔴 Critical | Block |

## Notes

- Weights are fully configurable without code changes via `configs/risk_weights.yaml`.
- The engine supports both **synchronous** (all modules) and **selective** (subset of modules) scoring modes.
