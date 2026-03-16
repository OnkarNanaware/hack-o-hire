from abc import ABC, abstractmethod
from typing import Any, Dict, List
from pydantic import BaseModel

class ModuleResult(BaseModel):
    module_name: str
    risk_score: float  # 0.0 to 1.0 (0.0 = safe, 1.0 = critical)
    confidence: float  # 0.0 to 1.0
    flags: List[str]
    metadata: Dict[str, Any] = {}

class ScanResult(BaseModel):
    scan_id: str
    timestamp: str
    unified_risk_score: int  # 0 to 100
    risk_tier: str
    module_results: List[ModuleResult]
    nl_explanation: str
    recommended_actions: List[str]

class BasePipeline(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    async def preprocess(self, raw_input: Any) -> Any:
        pass

    @abstractmethod
    async def infer(self, features: Any) -> List[ModuleResult]:
        pass

    @abstractmethod
    async def postprocess(self, module_results: List[ModuleResult]) -> ScanResult:
        pass

    @abstractmethod
    async def explain(self, scan_result: ScanResult) -> str:
        pass

    async def run(self, raw_input: Any) -> ScanResult:
        features = await self.preprocess(raw_input)
        module_results = await self.infer(features)
        scan_result = await self.postprocess(module_results)
        scan_result.nl_explanation = await self.explain(scan_result)
        return scan_result
