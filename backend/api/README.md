# `/backend/api`

This directory contains all FastAPI route definitions and endpoint handlers.

## Structure

```
api/
├── routes/
│   ├── email.py          # POST /api/email/scan
│   ├── attachment.py     # POST /api/attachment/scan
│   ├── website.py        # POST /api/website/scan
│   ├── voice.py          # POST /api/voice/scan
│   ├── prompt.py         # POST /api/prompt/scan
│   ├── credential.py     # POST /api/credential/scan
│   └── sandbox.py        # POST /api/sandbox/run
├── middleware/
│   ├── auth.py           # JWT / API-key authentication
│   ├── rate_limiter.py   # Per-IP rate limiting
│   └── cors.py           # CORS configuration
├── schemas/
│   ├── request.py        # Pydantic request models
│   └── response.py       # Pydantic response models
└── main.py               # FastAPI app factory & router registration
```

## Responsibilities

- Validate all incoming payloads via Pydantic schemas
- Route requests to the appropriate detection module
- Aggregate module scores through the Risk Engine
- Return a unified response including module scores, overall risk score (0–100), and recommended action
- Handle authentication, CORS, and rate limiting via middleware
