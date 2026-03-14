import React, { useState } from 'react'
import { Globe, Search, AlertCircle, Link2 } from 'lucide-react'
import RiskScoreCard from '../components/RiskScoreCard'
import { scanWebsite, type ScanResult } from '../services/api'

// ─────────────────────────────────────────────────────────
// Website Spoofing Detector Page
// ─────────────────────────────────────────────────────────

const INDICATOR_LABELS: Record<string, string> = {
  visual_similarity: 'Visual Clone Score',
  domain_age_days: 'Domain Age (days)',
  tls_valid: 'Valid TLS Certificate',
  whois_match: 'WHOIS Legitimacy',
  redirect_chain: 'Redirect Chain Depth',
}

const WebsiteScanner: React.FC = () => {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await scanWebsite(url)
      setResult(data)
    } catch {
      setError('Failed to analyze URL. Ensure the API is running and the URL is accessible.')
    } finally {
      setIsLoading(false)
    }
  }

  const isValidUrl = (s: string) => {
    try { new URL(s); return true } catch { return false }
  }

  const canScan = isValidUrl(url) && !isLoading

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10,
            background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={20} color="#f97316" />
          </div>
          <div>
            <h1>Website Spoofing Detector</h1>
            <p>Detect visual clones and lookalike domains using CNN + WHOIS analysis</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Enter URL to Analyze</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Link2 size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  className="input"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  style={{ paddingLeft: 36 }}
                  onKeyDown={(e) => e.key === 'Enter' && canScan && handleScan()}
                />
              </div>
            </div>

            {/* Quick examples */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6,
                textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try an example:</div>
              {['https://paypa1.com', 'https://amazon-secure-login.tk', 'https://google.com'].map((ex) => (
                <button key={ex} onClick={() => setUrl(ex)} style={{
                  display: 'inline-block', margin: '2px 4px',
                  padding: '4px 10px', borderRadius: 6, fontSize: 12,
                  background: 'rgba(0,212,255,0.05)', border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {ex}
                </button>
              ))}
            </div>

            {error && (
              <div style={{ display: 'flex', gap: 8, padding: '10px 14px', marginBottom: 12,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8, color: '#f87171', fontSize: 13 }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <button className="btn btn-primary" onClick={handleScan} disabled={!canScan}
              style={{ width: '100%', justifyContent: 'center', opacity: canScan ? 1 : 0.5 }}>
              {isLoading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Search size={16} />}
              {isLoading ? 'Scanning...' : 'Analyze Website'}
            </button>
          </div>

          {/* Analysis checklist */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Analysis Pipeline</div>
            {['Visual similarity fingerprinting (CNN)', 'Domain age + WHOIS verification', 'TLS certificate chain validation', 'Screenshot comparison with known brands', 'Redirect chain analysis', 'URL lexical feature scoring'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0', borderBottom: '1px solid rgba(0,212,255,0.05)', fontSize: 13,
                color: 'var(--color-text-secondary)' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: 'var(--color-accent-cyan)' }}>
                  {i + 1}
                </div>
                {step}
              </div>
            ))}
          </div>
        </div>

        <div>
          {isLoading && <RiskScoreCard score={0} tier="safe" action="Scanning..." isLoading />}
          {result && !isLoading && (
            <RiskScoreCard
              score={result.unified_risk_score}
              tier={result.risk_tier}
              action={result.recommended_action}
            />
          )}
          {!result && !isLoading && (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <Globe size={40} color="var(--color-text-muted)" style={{ marginBottom: 16 }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>Enter a URL to detect spoofing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WebsiteScanner
