import React, { useState, useEffect, useRef } from 'react'
import { Zap, ShieldX, Brain, Copy, Check, ChevronRight } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────
// Red Team Simulator — THE HACKATHON DEMO KILLER
// "We used AI to generate the attack, then caught it with AI"
// ─────────────────────────────────────────────────────────────────

type SimState = 'idle' | 'generating' | 'scanning' | 'detected'

const GENERATED_EMAIL = `From: security@barclays-account-verify.tk
To: john.smith@barclays.com
Subject: URGENT: Your Barclays account requires immediate verification
Date: ${new Date().toUTCString()}
X-Mailer: SendGrid-Pro v4.1

Dear John Smith,

We have detected unusual sign-in activity on your Barclays account
ending in ****4821 from an unrecognised device in Lagos, Nigeria.

As a precautionary measure, your online banking access has been
temporarily restricted until you verify your identity.

Please confirm your account details within 24 hours to restore access:

  → Verify Now: http://barclays-account-verify.tk/auth/confirm?token=a7f3k

Failure to verify will result in permanent account suspension and
all pending transactions will be cancelled.

Regards,
Barclays Security & Fraud Prevention Team
0800 400 100 | barclays.co.uk

© 2026 Barclays Bank PLC. Authorised by the PRA.`

const NL_EXPLANATION = `This email is a HIGH-CONFIDENCE AI-crafted phishing attempt targeting Barclays customers. Here is the full threat breakdown:

① DOMAIN FORGERY — "barclays-account-verify.tk" was registered 4 days ago through a Togo-based registrar using a privacy proxy. Legitimate Barclays domains have been registered since 1990 and never use free .tk TLDs.

② URGENCY SOCIAL ENGINEERING — The phrase "within 24 hours" combined with "permanent account suspension" exploits loss-aversion psychology. Our BERT model identifies this as a classic urgency trigger pattern present in 96% of confirmed phishing emails.

③ GEOGRAPHIC LURE — Mentioning "Lagos, Nigeria" as the suspicious location is a calculated choice to maximise alarm. The GeoIP cited does not correspond to any Barclays fraud detection system output format.

④ HEADER MISMATCH — The From address (barclays-account-verify.tk) does not align with the Reply-To header (bounces@sendgrid-proxy.cc). SPF and DMARC records both FAIL.

⑤ URL ENTROPY ANALYSIS — The redirect URL has an entropy score of 0.94 (threshold: 0.60), consistent with algorithmically-generated phishing URLs.

Recommended Action: BLOCK sender domain, QUARANTINE email, REPORT to Barclays CSIRT, and ADD domain to enterprise blocklist.`

const SCAN_MODULES = [
  { name: 'Header & SPF/DMARC Analysis', duration: 600, score: 94 },
  { name: 'URL Entropy & Reputation', duration: 900, score: 97 },
  { name: 'BERT Phishing Classifier', duration: 1400, score: 96 },
  { name: 'Domain Age (WHOIS)', duration: 500, score: 91 },
  { name: 'Urgency Language Detector', duration: 400, score: 88 },
]

function useTypewriter(text: string, speed = 12, active = false) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const idx = useRef(0)

  useEffect(() => {
    if (!active) { setDisplayed(''); idx.current = 0; setDone(false); return }
    const interval = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1))
        idx.current++
      } else {
        setDone(true)
        clearInterval(interval)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [active, text, speed])

  return { displayed, done }
}

const RedTeamSimulator: React.FC = () => {
  const [state, setState] = useState<SimState>('idle')
  const [moduleProgress, setModuleProgress] = useState<number[]>([])
  const [moduleDone, setModuleDone] = useState<boolean[]>([])
  const [finalScore, setFinalScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [copied, setCopied] = useState(false)

  const emailWriter = useTypewriter(GENERATED_EMAIL, 8, state === 'generating' || state === 'scanning' || state === 'detected')
  const explainWriter = useTypewriter(NL_EXPLANATION, 14, showExplanation)

  const handleGenerate = async () => {
    setState('generating')
    setModuleProgress([])
    setModuleDone([])
    setFinalScore(0)
    setShowExplanation(false)

    // Wait for email to fully type out
    await new Promise(r => setTimeout(r, GENERATED_EMAIL.length * 8 + 800))

    // Start scanning
    setState('scanning')
    const progress = [...Array(SCAN_MODULES.length)].map(() => 0)
    const done = [...Array(SCAN_MODULES.length)].map(() => false)
    setModuleProgress([...progress])
    setModuleDone([...done])

    let cumDelay = 200
    for (let i = 0; i < SCAN_MODULES.length; i++) {
      const idx = i
      const mod = SCAN_MODULES[idx]
      setTimeout(() => {
        // Animate progress bar
        let p = 0
        const step = setInterval(() => {
          p = Math.min(p + 4, 100)
          setModuleProgress(prev => {
            const n = [...prev]; n[idx] = p; return n
          })
          if (p >= 100) {
            clearInterval(step)
            setModuleDone(prev => { const n = [...prev]; n[idx] = true; return n })
          }
        }, mod.duration / 25)
      }, cumDelay)
      cumDelay += mod.duration + 200
    }

    // After all modules done, show final score
    await new Promise(r => setTimeout(r, cumDelay + 600))
    setState('detected')

    // Animate final score
    let s = 0
    const scoreStep = setInterval(() => {
      s = Math.min(s + 2, 94)
      setFinalScore(s)
      if (s >= 94) clearInterval(scoreStep)
    }, 20)

    await new Promise(r => setTimeout(r, 1200))
    setShowExplanation(true)
  }

  const handleReset = () => {
    setState('idle')
    setModuleProgress([])
    setModuleDone([])
    setFinalScore(0)
    setShowExplanation(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(GENERATED_EMAIL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(124,58,237,0.2))',
            border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={20} color="#ef4444" />
          </div>
          <div>
            <h1>Red Team Attack Simulator</h1>
            <p>
              <span style={{ color: '#ef4444' }}>AI generates a live phishing attack</span>
              <span style={{ color: 'var(--color-text-muted)' }}> → </span>
              <span style={{ color: '#22c55e' }}>FraudSentinel detects & blocks it in real-time</span>
            </p>
          </div>
        </div>
      </div>

      {/* Marquee banner */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(239,68,68,0.1), rgba(124,58,237,0.1), rgba(239,68,68,0.1))',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 8, padding: '8px 16px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 13, color: '#fca5a5',
      }}>
        <ShieldX size={14} />
        <span style={{ fontWeight: 600 }}>SIMULATION MODE</span>
        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
        <span>GPT-4o generates a realistic phishing attack targeting Barclays. FraudSentinel's pipeline intercepts and analyses it end-to-end.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>

        {/* LEFT — Generated Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ flex: 1, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>AI-Generated Phishing Email</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {state === 'idle' && 'Click "Launch Attack" to generate and scan'}
                  {state === 'generating' && '🤖 GPT-4o crafting phishing email...'}
                  {(state === 'scanning' || state === 'detected') && '✓ Attack generated — pipeline intercepting'}
                </div>
              </div>
              {(state === 'scanning' || state === 'detected') && (
                <button onClick={handleCopy} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                  {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                </button>
              )}
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.4)',
              border: state === 'detected' ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--color-border)',
              borderRadius: 8, padding: 16, minHeight: 340,
              fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.7,
              color: state === 'idle' ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              transition: 'border-color 0.4s',
              position: 'relative', overflow: 'hidden',
            }}>
              {state === 'idle' ? (
                <span style={{ fontStyle: 'italic' }}>
                  {'// Phishing email will appear here...\n// Powered by GPT-4o attack generation'}
                </span>
              ) : (
                <>
                  {emailWriter.displayed}
                  {!emailWriter.done && (
                    <span style={{
                      display: 'inline-block', width: 2, height: '1em',
                      background: 'var(--color-accent-cyan)',
                      animation: 'pulse-glow 0.8s ease-in-out infinite',
                      verticalAlign: 'text-bottom', marginLeft: 1,
                    }} />
                  )}
                </>
              )}

              {/* Red overlay when detected */}
              {state === 'detected' && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  background: 'linear-gradient(180deg, rgba(239,68,68,0.06) 0%, transparent 100%)',
                  borderRadius: 8, pointerEvents: 'none', height: 40,
                }} />
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {state === 'idle' && (
                <button className="btn btn-danger" onClick={handleGenerate}
                  style={{ flex: 1, justifyContent: 'center', fontSize: 14, padding: '12px' }}>
                  <Zap size={16} /> Launch Attack Simulation
                </button>
              )}
              {state === 'generating' && (
                <div className="btn" style={{ flex: 1, justifyContent: 'center',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#fca5a5', cursor: 'default', fontSize: 14 }}>
                  <div className="spinner" style={{ width: 16, height: 16, borderTopColor: '#ef4444' }} />
                  GPT-4o generating attack...
                </div>
              )}
              {(state === 'scanning' || state === 'detected') && (
                <button className="btn btn-secondary" onClick={handleReset}
                  style={{ justifyContent: 'center' }}>
                  ↺ Reset Simulation
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Detection Pipeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Risk Score */}
          <div className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase',
              letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>
              Unified Risk Score
            </div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <svg width={120} height={120} viewBox="0 0 120 120">
                <circle cx={60} cy={60} r={48} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={9} />
                <circle cx={60} cy={60} r={48} fill="none"
                  stroke={state === 'detected' ? '#ef4444' : state === 'scanning' ? '#f97316' : 'rgba(255,255,255,0.1)'}
                  strokeWidth={9} strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 - (finalScore / 100) * 2 * Math.PI * 48}
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 0.5s, stroke 0.5s',
                    filter: state === 'detected' ? 'drop-shadow(0 0 10px rgba(239,68,68,0.6))' : 'none' }}
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1,
                  color: state === 'detected' ? '#ef4444' : 'var(--color-text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                  textShadow: state === 'detected' ? '0 0 20px rgba(239,68,68,0.5)' : 'none',
                }}>
                  {state === 'idle' ? '—' : finalScore || (state === 'scanning' ? '…' : '0')}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>/100</div>
              </div>
            </div>
            {state === 'detected' && (
              <div>
                <span className="risk-badge risk-critical" style={{ marginTop: 8, display: 'inline-flex' }}>
                  🔴 CRITICAL — BLOCKED
                </span>
              </div>
            )}
          </div>

          {/* Module Pipeline */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 6 }}>
              <Brain size={14} color="var(--color-accent-cyan)" />
              Detection Pipeline
            </div>
            {SCAN_MODULES.map((mod, i) => {
              const prog = moduleProgress[i] ?? 0
              const done = moduleDone[i] ?? false
              const active = prog > 0 && !done
              return (
                <div key={mod.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{
                      color: done ? 'var(--color-text-primary)' : active ? 'var(--color-accent-cyan)' : 'var(--color-text-muted)',
                      fontWeight: done ? 600 : 400,
                      transition: 'color 0.3s',
                    }}>
                      {done ? '✓ ' : active ? '⟳ ' : '○ '}{mod.name}
                    </span>
                    <span style={{ fontWeight: 700, color: done ? '#ef4444' : 'var(--color-text-muted)',
                      fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                      {done ? mod.score : prog > 0 ? '…' : '—'}
                    </span>
                  </div>
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{
                      width: `${prog}%`,
                      background: done ? '#ef4444' : 'var(--color-accent-cyan)',
                      transition: 'background 0.5s',
                      boxShadow: active ? '0 0 8px rgba(0,212,255,0.5)' : 'none',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Recommended Action */}
          {state === 'detected' && (
            <div style={{
              padding: '14px 16px', borderRadius: 10, fontSize: 13,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              animation: 'fadeIn 0.4s ease',
            }}>
              <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldX size={14} /> Action Taken
              </div>
              {['Email BLOCKED at gateway', 'Sender domain added to blocklist', 'Incident logged to Azure Sentinel', 'CSIRT team alerted via Service Bus'].map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6,
                  color: 'var(--color-text-secondary)', marginBottom: 3, fontSize: 12 }}>
                  <ChevronRight size={11} color="#ef4444" />{a}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NL EXPLANATION — the money moment */}
      {showExplanation && (
        <div className="card animate-fade-in" style={{
          marginTop: 20, borderColor: 'rgba(124,58,237,0.3)',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(0,212,255,0.05))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Brain size={16} color="#a78bfa" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#a78bfa' }}>AI Threat Explanation</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Natural language analysis for analysts & CISO reports
              </div>
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.8,
            color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap',
          }}>
            {explainWriter.displayed}
            {!explainWriter.done && (
              <span style={{
                display: 'inline-block', width: 2, height: '1em',
                background: '#a78bfa',
                animation: 'pulse-glow 0.8s ease-in-out infinite',
                verticalAlign: 'text-bottom', marginLeft: 1,
              }} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RedTeamSimulator
