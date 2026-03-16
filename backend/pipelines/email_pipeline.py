from .base_pipeline import BasePipeline, ModuleResult, ScanResult
from ..agents.base_agent import AgentOrchestrator
from ..agents.security_agents import EmailHeaderAgent, BehavioralAgent
from ..agents.llm_agent import LLMAnalyzerAgent
from typing import Any, List
import uuid
from datetime import datetime

class EmailPhishingPipeline(BasePipeline):
    def __init__(self):
        super().__init__("EmailPhishingPipeline")
        self.orchestrator = AgentOrchestrator([
            EmailHeaderAgent(),
            BehavioralAgent(),
            LLMAnalyzerAgent()
        ])

    async def preprocess(self, raw_input: Any) -> Any:
        # raw_input is expected to be a dict with 'sender', 'body', 'headers'
        return raw_input

    async def infer(self, features: Any) -> List[ModuleResult]:
        observations = await self.orchestrator.run_analysis(features)
        
        module_results = []
        for obs in observations:
            module_results.append(ModuleResult(
                module_name=obs.agent_name,
                risk_score=obs.risk_score,
                confidence=obs.confidence,
                flags=obs.findings,
                metadata=obs.metadata
            ))
        return module_results

    async def postprocess(self, module_results: List[ModuleResult]) -> ScanResult:
        max_score = max([m.risk_score for m in module_results]) if module_results else 0.0
        unified_score = int(max_score * 100)
        
        risk_tier = "low"
        if unified_score > 80: risk_tier = "critical"
        elif unified_score > 50: risk_tier = "high"
        
        return ScanResult(
            scan_id=str(uuid.uuid4()),
            timestamp=datetime.utcnow().isoformat(),
            unified_risk_score=unified_score,
            risk_tier=risk_tier,
            module_results=module_results,
            nl_explanation="",
            recommended_actions=["Block Sender", "Quarantine Email"] if unified_score > 50 else ["Allow"]
        )

    async def explain(self, scan_result: ScanResult) -> str:
        explanation = f"Phishing analysis result: {scan_result.risk_tier} risk.\n\n"
        for res in scan_result.module_results:
            if res.flags:
                explanation += f"- {res.module_name}: {', '.join(res.flags)}\n"
        return explanation
