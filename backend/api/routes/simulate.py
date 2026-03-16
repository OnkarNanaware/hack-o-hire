"""
Red Team Attack Simulation + AI Explainability API Routes
═══════════════════════════════════════════════════════════
These are the backend stubs for the two flagship hackathon features:

1. POST /api/simulate/attack
   → Calls GPT-4o to generate a realistic phishing email
   → Immediately runs it through the phishing email pipeline
   → Returns full ScanResult with NL explanation

2. POST /api/explain
   → Takes any ScanResult and calls GPT-4o
   → Returns a plain-English explanation of why the threat was flagged
   → Suitable for CISO reports / auditor briefings

3. GET /api/threats/live
   → Server-Sent Events (SSE) stream of live threat events
   → Powers the LiveThreatFeed dashboard component in production
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import asyncio
import json
import uuid
from datetime import datetime

router = APIRouter(prefix="/api", tags=["redteam", "explain", "live-threats"])


# ─────────────────────────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────────────────────────

class SimulateAttackRequest(BaseModel):
    target_org: str = "Barclays Bank"
    attack_type: str = "spear_phishing"  # spear_phishing | ceo_fraud | credential_harvest
    target_name: Optional[str] = "Security Team"


class ExplainRequest(BaseModel):
    scan_id: str
    module_scores: list
    unified_risk_score: int
    risk_tier: str
    flags: list[str]


class ExplainResponse(BaseModel):
    scan_id: str
    explanation: str
    key_indicators: list[str]
    recommended_actions: list[str]
    confidence: float


# ─────────────────────────────────────────────────────────────────
# POST /api/simulate/attack
# ─────────────────────────────────────────────────────────────────

@router.post("/simulate/attack")
async def simulate_attack(request: SimulateAttackRequest):
    """
    Stage 1: Call GPT-4o to generate a realistic phishing email
    Stage 2: Run generated email through phishing_email_pipeline
    Stage 3: Call GPT-4o again to produce NL explanation
    Stage 4: Return unified ScanResult + NL explanation

    TODO: Replace stubs below with:
      from backend.pipelines.email_pipeline import EmailPhishingPipeline
      from backend.risk_engine.scorer import RiskEngine
      from openai import AsyncOpenAI

      client = AsyncOpenAI()

      # Stage 1 — Generate attack
      response = await client.chat.completions.create(
          model="gpt-4o",
          messages=[{
              "role": "system",
              "content": "You are a red team security researcher generating realistic phishing emails for security testing. Output only the raw email content including headers."
          }, {
              "role": "user",
              "content": f"Generate a convincing spear phishing email targeting {request.target_name} at {request.target_org}. Make it realistic with proper headers."
          }]
      )
      generated_email = response.choices[0].message.content

      # Stage 2 — Scan it
      pipeline = EmailPhishingPipeline()
      result = await pipeline.run(generated_email)

      # Stage 3 — Explain it
      explain_response = await client.chat.completions.create(
          model="gpt-4o",
          messages=[...]
      )
    """

    from ...pipelines.email_pipeline import EmailPhishingPipeline
    
    pipeline = EmailPhishingPipeline()
    
    # Simulate an email body based on the request
    fake_email = {
        "sender": f"security@{request.target_org.lower().replace(' ', '')}.support.com",
        "body": f"URGENT: Your {request.target_org} account has been compromised. Please login immediately to verify your identity.",
        "headers": {"spf": "fail"}
    }
    
    scan_result = await pipeline.run(fake_email)
    
    return {
        "scan_id": scan_result.scan_id,
        "timestamp": scan_result.timestamp,
        "generated_attack": {
            "type": request.attack_type,
            "target_org": request.target_org,
            "model": "gpt-4o",
            "generation_time_ms": 1200,
        },
        "unified_risk_score": scan_result.unified_risk_score,
        "risk_tier": scan_result.risk_tier,
        "recommended_action": scan_result.recommended_actions[0] if scan_result.recommended_actions else "none",
        "module_scores": [
            {"module_name": m.module_name, "risk_score": int(m.risk_score * 100), "confidence": int(m.confidence * 100), "flags": m.flags}
            for m in scan_result.module_results
        ],
        "nl_explanation": scan_result.nl_explanation,
        "processing_time_ms": 1500,
    }


# ─────────────────────────────────────────────────────────────────
# POST /api/explain
# ─────────────────────────────────────────────────────────────────

@router.post("/explain", response_model=ExplainResponse)
async def explain_threat(request: ExplainRequest):
    """
    Takes any scan result and produces a natural-language explanation.
    Used by the frontend's "Explain This Threat" button on any result page.

    TODO: Replace stub with actual GPT-4o call:
      from openai import AsyncOpenAI
      client = AsyncOpenAI()

      prompt = f\"\"\"
      You are a senior cybersecurity analyst at Barclays Bank.
      Explain the following fraud detection result in plain English,
      suitable for a CISO briefing. Be specific, actionable, and concise.

      Risk Score: {request.unified_risk_score}/100
      Tier: {request.risk_tier}
      Detection flags: {', '.join(request.flags)}
      Module scores: {json.dumps(request.module_scores)}
      \"\"\"
    """
    return ExplainResponse(
        scan_id=request.scan_id,
        explanation=(
            f"This threat scored {request.unified_risk_score}/100 (CRITICAL tier). "
            "Multiple independent detection signals confirm this is a coordinated AI-assisted fraud attempt. "
            "BERT classifier confidence: 96.4%. Domain registered 4 days ago. SPF/DMARC both fail."
        ),
        key_indicators=request.flags,
        recommended_actions=[
            "Block sender domain at email gateway",
            "Add URL to enterprise blocklist",
            "Log incident to Azure Sentinel",
            "Notify Barclays CSIRT team",
            "Preserve evidence for FCA audit trail",
        ],
        confidence=0.964,
    )


# ─────────────────────────────────────────────────────────────────
# GET /api/threats/live  (Server-Sent Events)
# Powers LiveThreatFeed in production — frontend polls this
# ─────────────────────────────────────────────────────────────────

@router.get("/threats/live")
async def live_threats():
    """
    Server-Sent Events endpoint. Frontend EventSource connects here
    to receive real-time threat events as they are detected.

    In production: replaces the frontend mock interval with real events
    published from each detection module via Azure Service Bus subscriber.
    """
    async def event_generator():
        threat_pool = [
            {"type": "phishing_email", "score": 91, "source": "Email Gateway",
             "summary": "AI spear phish impersonating CFO", "action": "BLOCKED"},
            {"type": "prompt_injection", "score": 78, "source": "AI Agent Monitor",
             "summary": "Jailbreak: ignore previous instructions", "action": "QUARANTINE"},
            {"type": "deepfake_voice", "score": 83, "source": "Call Centre",
             "summary": "Synthetic voice cloning CEO impersonation", "action": "BLOCKED"},
        ]
        i = 0
        while True:
            threat = threat_pool[i % len(threat_pool)]
            threat["id"] = str(uuid.uuid4())
            threat["timestamp"] = datetime.utcnow().isoformat()
            yield f"data: {json.dumps(threat)}\n\n"
            i += 1
            await asyncio.sleep(4)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
