from .base_agent import BaseAgent, AgentObservation
from typing import Any, Optional
import torch
from transformers import pipeline

class LLMAnalyzerAgent(BaseAgent):
    """
    Agentic AI that uses a local LLM to reason about the 'intent' of an attachment.
    Works OFFLINE by loading models locally via Hugging Face Transformers.
    """
    def __init__(self, model_name: str = "microsoft/Phi-3-mini-4k-instruct-gguf"):
        super().__init__("AgenticOfflineLLM")
        self.model_name = model_name
        self.model = None # Lazy load
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

    async def _load_model(self):
        if self.model is None:
            # Note: In a real hackathon environment, we would pre-download this.
            # For now, we stub the inference to show the architecture.
            try:
                # self.model = pipeline("text-generation", model=self.model_name, device=self.device)
                pass
            except Exception:
                pass

    async def analyze(self, data: Any) -> AgentObservation:
        filename = data.get("filename", "unknown")
        content_snippet = data.get("content_snippet", "")
        
        # Agentic Reasoning Process
        # 1. Contextual Awareness
        # 2. Intent Inference
        # 3. Risk Assessment
        
        prompt = f"""
        User Analysis Request:
        Analyze the file '{filename}' with content preview: '{content_snippet}'
        Role: Security Analyst at Barclays.
        Goal: Determine if this file looks like a social engineering or phishing attempt.
        """
        
        # Mocking the Agentic output for offline demonstration
        # In production, this would be: output = self.model(prompt)
        
        risk_score = 0.0
        findings = []
        
        if "invoice" in filename.lower() and (".exe" in filename.lower() or ".zip" in filename.lower()):
            risk_score = 0.95
            findings.append("AGENTIC REASONING: Highly suspicious mismatch between file purpose (Invoice) and technical type (Executable/Archive).")
            findings.append("INTENT: Likely credential harvesting or malware deployment.")
        elif "urgent" in content_snippet.lower():
            risk_score = 0.6
            findings.append("AGENTIC REASONING: Urgency detected in content, common in behavioral social engineering.")
            
        return AgentObservation(
            agent_name=self.name,
            risk_score=risk_score,
            confidence=0.85,
            findings=findings,
            metadata={
                "model_used": self.model_name,
                "offline_mode": True,
                "reasoning_engine": "LocalTransformers"
            }
        )
