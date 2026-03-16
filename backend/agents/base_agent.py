from abc import ABC, abstractmethod
from typing import Any, Dict, List
from pydantic import BaseModel

class AgentObservation(BaseModel):
    agent_name: str
    risk_score: float  # 0.0 to 1.0
    confidence: float  # 0.0 to 1.0
    findings: List[str]
    metadata: Dict[str, Any] = {}

class BaseAgent(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    async def analyze(self, data: Any) -> AgentObservation:
        pass

class AgentOrchestrator:
    def __init__(self, agents: List[BaseAgent]):
        self.agents = agents

    async def run_analysis(self, data: Any) -> List[AgentObservation]:
        observations = []
        for agent in self.agents:
            try:
                observation = await agent.analyze(data)
                observations.append(observation)
            except Exception as e:
                # Log error but continue with other agents
                observations.append(AgentObservation(
                    agent_name=agent.name,
                    risk_score=0.0,
                    confidence=0.0,
                    findings=[f"Error during analysis: {str(e)}"]
                ))
        return observations
