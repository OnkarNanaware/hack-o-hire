import React, { useState } from 'react'
import { Paperclip, ShieldCheck, AlertCircle } from 'lucide-react'
import UploadPanel from '../components/UploadPanel'
import RiskScoreCard from '../components/RiskScoreCard'
import { scanAttachment, type ScanResult } from '../services/api'

const AttachmentScanner: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async () => {
    if (!selectedFile) return
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      const data = await scanAttachment(formData)
      setResult(data)
    } catch {
      setError('Attachment scan failed. Please check the API connection.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10,
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paperclip size={20} color="#7c3aed" />
          </div>
          <div>
            <h1>Malicious Attachment Scanner</h1>
            <p>Static analysis, YARA rule matching, and PE header inspection for malware detection</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Upload File for Analysis</div>
            <UploadPanel
              title="Drop any file to scan"
              description="PDF, Office docs, executables, ZIP archives — all supported"
              acceptedTypes={['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.exe', '.zip', '.rar', '.js', '.vbs']}
              maxSizeMb={25}
              onFileSelected={(f) => { setSelectedFile(f); setResult(null) }}
              onClear={() => setSelectedFile(null)}
              isLoading={isLoading}
            />
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Detection Methods</div>
            {[
              { label: 'YARA Rule Matching', desc: '7000+ custom malware signatures' },
              { label: 'PE Header Analysis', desc: 'Imports, sections, entropy scoring' },
              { label: 'Hash Reputation', desc: 'MalwareBazaar + VirusTotal lookup' },
              { label: 'Macro Extraction', desc: 'Office VBA/XLM macro detection' },
              { label: 'PDF Stream Analysis', desc: 'JavaScript, shellcode detection' },
            ].map((m) => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 13 }}>
                <span style={{ fontWeight: 500 }}>{m.label}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{m.desc}</span>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ display: 'flex', gap: 8, padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, color: '#f87171', fontSize: 13 }}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <button className="btn btn-primary" onClick={handleScan}
            disabled={!selectedFile || isLoading}
            style={{ width: '100%', justifyContent: 'center',
              opacity: selectedFile && !isLoading ? 1 : 0.5 }}>
            {isLoading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <ShieldCheck size={16} />}
            {isLoading ? 'Scanning...' : 'Scan Attachment'}
          </button>
        </div>

        <div>
          {isLoading && <RiskScoreCard score={0} tier="safe" action="Scanning..." isLoading />}
          {result && !isLoading && (
            <RiskScoreCard score={result.unified_risk_score} tier={result.risk_tier} action={result.recommended_action} />
          )}
          {!result && !isLoading && (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <Paperclip size={40} color="var(--color-text-muted)" style={{ marginBottom: 16 }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>Upload a file to begin malware analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttachmentScanner
