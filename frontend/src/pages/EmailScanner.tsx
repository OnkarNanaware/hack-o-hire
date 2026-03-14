import React, { useState } from 'react'
import { Mail, Send, AlertCircle } from 'lucide-react'
import UploadPanel from '../components/UploadPanel'
import RiskScoreCard from '../components/RiskScoreCard'
import { scanEmail, type ScanResult } from '../services/api'

// ─────────────────────────────────────────────────────────
// Email Scanner Page
// ─────────────────────────────────────────────────────────

const EmailScanner: React.FC = () => {
  const [emailText, setEmailText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      if (selectedFile) formData.append('file', selectedFile)
      else formData.append('text', emailText)
      const data = await scanEmail(formData)
      setResult(data)
    } catch {
      setError('Failed to scan email. Please check the API connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const canScan = (emailText.trim().length > 10 || selectedFile !== null) && !isLoading

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10,
            background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={20} color="var(--color-accent-cyan)" />
          </div>
          <div>
            <h1>Email Phishing Scanner</h1>
            <p>Detect AI-crafted phishing emails using transformer NLP + header analysis</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Input Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Upload .eml File</div>
            <UploadPanel
              title="Drop .eml or .txt file here"
              description="Drag and drop your email file, or click to browse"
              acceptedTypes={['.eml', '.txt', 'message/rfc822', 'text/plain']}
              maxSizeMb={10}
              onFileSelected={(f) => { setSelectedFile(f); setEmailText('') }}
              onClear={() => setSelectedFile(null)}
              isLoading={isLoading}
            />
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>
              Or Paste Email Content
            </div>
            <textarea
              className="input"
              value={emailText}
              onChange={(e) => { setEmailText(e.target.value); setSelectedFile(null) }}
              placeholder="Paste raw email headers + body here..."
              rows={8}
              style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 12 }}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', gap: 8, padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, color: '#f87171', fontSize: 13 }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          <button className="btn btn-primary" onClick={handleScan} disabled={!canScan}
            style={{ width: '100%', justifyContent: 'center', opacity: canScan ? 1 : 0.5 }}>
            {isLoading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Send size={16} />}
            {isLoading ? 'Analyzing...' : 'Scan for Phishing'}
          </button>
        </div>

        {/* Results Panel */}
        <div>
          {isLoading && <RiskScoreCard score={0} tier="safe" action="Processing..." isLoading />}
          {result && !isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <RiskScoreCard
                score={result.unified_risk_score}
                tier={result.risk_tier}
                action={result.recommended_action}
              />
              <div className="card">
                <div style={{ fontWeight: 600, marginBottom: 16 }}>Module Breakdown</div>
                {result.module_scores.map((m) => (
                  <div key={m.module_name} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between',
                      fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{m.module_name}</span>
                      <span style={{ fontWeight: 700 }}>{m.risk_score}</span>
                    </div>
                    <div className="score-bar-track">
                      <div className="score-bar-fill" style={{
                        width: `${m.risk_score}%`,
                        background: m.risk_score > 75 ? '#ef4444' : m.risk_score > 50 ? '#f97316' : '#eab308'
                      }} />
                    </div>
                  </div>
                ))}
                {result.module_scores?.[0]?.flags?.length > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)',
                      textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                      Detection Flags
                    </div>
                    {result.module_scores[0].flags.map((flag, i) => (
                      <div key={i} style={{ fontSize: 13, color: '#fca5a5',
                        padding: '4px 0', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                        ● {flag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {!result && !isLoading && (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <Mail size={40} color="var(--color-text-muted)" style={{ marginBottom: 16 }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Upload or paste an email to start analysis
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmailScanner
