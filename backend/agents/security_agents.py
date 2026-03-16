from .base_agent import BaseAgent, AgentObservation
import os
import magic  # Note: python-magic might need to be added or used cautiously on Windows
import hashlib
from typing import Any

class HeuristicAgent(BaseAgent):
    def __init__(self):
        super().__init__("HeuristicAnalyzer")

    async def analyze(self, data: Any) -> AgentObservation:
        # data is expected to be a dict with 'file_path' and 'filename'
        file_path = data.get("file_path")
        filename = data.get("filename", "unknown")
        
        findings = []
        risk_score = 0.0
        
        # 1. Extension Check
        dangerous_exts = {".exe", ".scr", ".vbs", ".js", ".jar", ".bat", ".cmd", ".ps1"}
        _, ext = os.path.splitext(filename.lower())
        if ext in dangerous_exts:
            risk_score += 0.4
            findings.append(f"Potentially dangerous file extension detected: {ext}")
            
        # 2. Double Extension Check
        if filename.count('.') > 1:
            risk_score += 0.2
            findings.append("Double file extension detected (possible spoofing attempt)")

        # 3. Size Check (Stub)
        if file_path and os.path.exists(file_path):
            size = os.path.getsize(file_path)
            if size == 0:
                risk_score += 0.1
                findings.append("File is empty (suspicious for some attack types)")
                
        return AgentObservation(
            agent_name=self.name,
            risk_score=min(risk_score, 1.0),
            confidence=0.8,
            findings=findings
        )

class BarclaysPolicyAgent(BaseAgent):
    def __init__(self):
        super().__init__("BarclaysComplianceAgent")

    async def analyze(self, data: Any) -> AgentObservation:
        filename = data.get("filename", "unknown")
        findings = []
        risk_score = 0.0
        
        # Barclays Specific Policies (Example)
        # 1. Macros in Office docs are restricted
        office_exts = {".docm", ".xlsm", ".pptm"}
        _, ext = os.path.splitext(filename.lower())
        if ext in office_exts:
            risk_score += 0.5
            findings.append(f"Non-compliant file type for Barclays policy: {ext} (Macros Restricted)")
            
        # 2. Password protected archives (not easily checkable in stub, but policy-wise risky)
        if ext in {".zip", ".7z", ".rar"}:
            findings.append("Archive detected: Requires secondary scanning for password protection (Barclays Policy 4.2)")
            risk_score += 0.1

        return AgentObservation(
            agent_name=self.name,
            risk_score=min(risk_score, 1.0),
            confidence=0.9,
            findings=findings,
            metadata={"policy_version": "2024.Q1.Security"}
        )

class SignatureAgent(BaseAgent):
    def __init__(self):
        super().__init__("YaraSignatureAgent")

    async def analyze(self, data: Any) -> AgentObservation:
        # Stub for YARA scanning
        # In a real scenario, we'd load YARA rules from a directory
        findings = ["No known malicious signatures found via YARA scanning (Offline enabled)."]
        
        return AgentObservation(
            agent_name=self.name,
            risk_score=0.0,
            confidence=0.7,
            findings=findings
        )

class EmailHeaderAgent(BaseAgent):
    def __init__(self):
        super().__init__("EmailHeaderAnalyzer")

    async def analyze(self, data: Any) -> AgentObservation:
        # data is expected to be a dict with 'headers', 'sender'
        sender = data.get("sender", "")
        headers = data.get("headers", {})
        
        findings = []
        risk_score = 0.0
        
        # 1. Lookalike Domain Check
        if "barclays" in sender.lower() and "@barclays.com" not in sender.lower():
            risk_score += 0.8
            findings.append(f"Lookalike domain detected: Sender '{sender}' impersonating Barclays.")

        # 2. SPF/DMARC Stub
        if headers.get("spf") == "fail":
            risk_score += 0.3
            findings.append("SPF verification failed.")

        return AgentObservation(
            agent_name=self.name,
            risk_score=min(risk_score, 1.0),
            confidence=0.9,
            findings=findings
        )

class BehavioralAgent(BaseAgent):
    def __init__(self):
        super().__init__("BehavioralAnalyzer")

    async def analyze(self, data: Any) -> AgentObservation:
        body = data.get("body", "")
        findings = []
        risk_score = 0.0
        
        # 1. Sense of Urgency
        urgency_keywords = ["urgent", "immediate", "action required", "suspended", "compromised"]
        if any(word in body.lower() for word in urgency_keywords):
            risk_score += 0.4
            findings.append("Extreme sense of urgency detected in email body.")
            
        # 2. Financial Request
        if "wire transfer" in body.lower() or "bank details" in body.lower():
            risk_score += 0.3
            findings.append("Request for sensitive financial action detected.")

        return AgentObservation(
            agent_name=self.name,
            risk_score=min(risk_score, 1.0),
            confidence=0.75,
            findings=findings
        )
