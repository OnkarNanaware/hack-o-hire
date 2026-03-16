from .base_pipeline import BasePipeline, ModuleResult, ScanResult
from ..agents.base_agent import AgentOrchestrator
from ..agents.security_agents import HeuristicAgent, SignatureAgent, BarclaysPolicyAgent
from ..agents.llm_agent import LLMAnalyzerAgent
from typing import Any, List
import uuid
from datetime import datetime

class AttachmentPipeline(BasePipeline):
    def __init__(self):
        super().__init__("AttachmentVerificationPipeline")
        # Orchestrate multiple agents for 'Agentic' decision making
        self.orchestrator = AgentOrchestrator([
            HeuristicAgent(),
            SignatureAgent(),
            BarclaysPolicyAgent(),
            LLMAnalyzerAgent()
        ])

    async def preprocess(self, raw_input: Any) -> Any:
        # raw_input is expected to be a dict with 'filename', 'file_path', 'content_snippet'
        return raw_input

    async def infer(self, features: Any) -> List[ModuleResult]:
        # Run the agentic orchestration
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
        # Calculate unified risk score (weighted average or max)
        # For simplicity, we use max() as a conservative security measure
        max_score = max([m.risk_score for m in module_results]) if module_results else 0.0
        unified_score = int(max_score * 100)
        
        risk_tier = "low"
        if unified_score > 80: risk_tier = "critical"
        elif unified_score > 50: risk_tier = "high"
        elif unified_score > 20: risk_tier = "medium"

        recommended_actions = []
        if unified_score > 50:
            recommended_actions = ["Block attachment", "Notify Security Operations", "Quarantine original email"]
        else:
            recommended_actions = ["Allow with warning", "Continue monitoring"]

        return ScanResult(
            scan_id=str(uuid.uuid4()),
            timestamp=datetime.utcnow().isoformat(),
            unified_risk_score=unified_score,
            risk_tier=risk_tier,
            module_results=module_results,
            nl_explanation="", # To be filled by explain()
            recommended_actions=recommended_actions
        )

    async def explain(self, scan_result: ScanResult) -> str:
        # Construct an 'Agentic' explanation from findings
        all_findings = []
        for res in scan_result.module_results:
            if res.flags:
                all_findings.extend(res.flags)
        
        explanation = f"The attachment was flagged as '{scan_result.risk_tier}' risk ({scan_result.unified_risk_score}/100).\n\n"
        explanation += "Multi-agent consensus findings:\n"
        for finding in all_findings:
            explanation += f"- {finding}\n"
            
        explanation += "\nThis analysis was performed locally (OFFLINE) using the Barclays Agentic AI Layer."
        return explanation
