import React, { useState } from 'react'
import { Mic, Volume2, AlertCircle } from 'lucide-react'
import UploadPanel from '../components/UploadPanel'
import RiskScoreCard from '../components/RiskScoreCard'
import { scanVoice, type ScanResult } from '../services/api'

const VoiceDetector: React.FC = () => {
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
      const data = await scanVoice(formData)
      setResult(data)
    } catch {
      setError('Voice analysis failed. Please check the API connection.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10,
            background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mic size={20} color="#ec4899" />
          </div>
          <div>
            <h1>Deepfake Voice Detector</h1>
            <p>Detect AI-synthesized voice using MFCC feature extraction + Wav2Vec2 anti-spoofing</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Upload Audio File</div>
            <UploadPanel
              title="Drop audio file here"
              description="WAV, MP3, FLAC, or OGG audio clips"
              acceptedTypes={['.wav', '.mp3', '.flac', '.ogg', 'audio/*']}
              maxSizeMb={50}
              onFileSelected={(f) => { setSelectedFile(f); setResult(null) }}
              onClear={() => setSelectedFile(null)}
              isLoading={isLoading}
            />
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Analysis Pipeline</div>
            <div style={{ position: 'relative', paddingLeft: 24 }}>
              {[
                { step: 'Load & normalize audio (16kHz)', color: '#00d4ff' },
                { step: 'Extract 40 MFCC coefficients', color: '#7c3aed' },
                { step: 'Spectral flux + zero-crossing rate', color: '#ec4899' },
                { step: 'SVM anti-spoofing classifier', color: '#f97316' },
                { step: 'Wav2Vec2 deep feature extraction', color: '#eab308' },
                { step: 'Ensemble confidence score → Fraud prediction', color: '#22c55e' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12,
                  marginBottom: 12, position: 'relative' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5,
                    background: s.color, boxShadow: `0 0 6px ${s.color}`, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{s.step}</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', gap: 8, padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, color: '#f87171', fontSize: 13 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <button className="btn btn-primary" onClick={handleScan}
            disabled={!selectedFile || isLoading}
            style={{ width: '100%', justifyContent: 'center',
              opacity: selectedFile && !isLoading ? 1 : 0.5 }}>
            {isLoading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Volume2 size={16} />}
            {isLoading ? 'Analyzing audio...' : 'Detect Deepfake'}
          </button>
        </div>

        <div>
          {isLoading && <RiskScoreCard score={0} tier="safe" action="Analyzing..." isLoading />}
          {result && !isLoading && (
            <RiskScoreCard score={result.unified_risk_score} tier={result.risk_tier} action={result.recommended_action} />
          )}
          {!result && !isLoading && (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <Mic size={40} color="var(--color-text-muted)" style={{ marginBottom: 16 }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>Upload an audio clip to analyze for voice synthesis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VoiceDetector
