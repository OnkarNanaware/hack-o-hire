import React, { useState, useEffect, useRef } from 'react'
import { PoundSterling, TrendingDown, Shield } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────
// FinancialImpactCard
// Shows live ROI: threats blocked × average fraud cost = £ saved
// Industry data: UK Finance 2024 report — avg bank fraud loss £28,500/incident
// ─────────────────────────────────────────────────────────────────

const AVG_COST_PER_INCIDENT_GBP = 28500
const INITIAL_BLOCKED = 53

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0)
  const raf = useRef<number>(0)
  const startTime = useRef<number>(0)

  useEffect(() => {
    startTime.current = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return value
}

const FinancialImpactCard: React.FC = () => {
  const [threatsBlocked, setThreatsBlocked] = useState(INITIAL_BLOCKED)
  const [totalSaved, setTotalSaved] = useState(INITIAL_BLOCKED * AVG_COST_PER_INCIDENT_GBP)
  const [lastIncrement, setLastIncrement] = useState<number | null>(null)

  const animatedSaved = useCountUp(totalSaved, 1200)

  useEffect(() => {
    // Increment counter every 12–20 seconds to simulate new detections
    const interval = setInterval(() => {
      const newBlocked = Math.floor(Math.random() * 3) + 1
      setThreatsBlocked(prev => {
        const next = prev + newBlocked
        setTotalSaved(next * AVG_COST_PER_INCIDENT_GBP)
        setLastIncrement(newBlocked)
        setTimeout(() => setLastIncrement(null), 3000)
        return next
      })
    }, 14000 + Math.random() * 6000)
    return () => clearInterval(interval)
  }, [])

  const formatGBP = (n: number) => '£' + n.toLocaleString('en-GB')

  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, rgba(34,197,94,0.05) 0%, rgba(0,212,255,0.05) 100%)',
      borderColor: 'rgba(34,197,94,0.2)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 120, height: 120,
        background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: '#4ade80', textTransform: 'uppercase',
            letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>
            Financial Impact
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            Estimated losses prevented (session)
          </div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <PoundSterling size={20} color="#22c55e" />
        </div>
      </div>

      {/* Big number */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontSize: 38, fontWeight: 800, lineHeight: 1,
          color: '#22c55e',
          fontVariantNumeric: 'tabular-nums',
          textShadow: '0 0 30px rgba(34,197,94,0.3)',
        }}>
          {formatGBP(animatedSaved)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingDown size={13} color="#22c55e" />
          Prevented since session start
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 10, marginBottom: 12,
      }}>
        {[
          { label: 'Threats Blocked', value: threatsBlocked, color: '#ef4444' },
          { label: 'Avg Cost/Incident', value: '£28,500', color: '#eab308' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '10px 12px', borderRadius: 8,
            background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)',
          }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color,
              fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Annualised */}
      <div style={{
        padding: '8px 12px', borderRadius: 8,
        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)',
        fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>
          <Shield size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Annualised projection
        </span>
        <span style={{ fontWeight: 800, color: '#4ade80', fontSize: 13 }}>
          £{(threatsBlocked * AVG_COST_PER_INCIDENT_GBP * 365).toLocaleString('en-GB')}+
        </span>
      </div>

      {/* Flash notification when new threat blocked */}
      {lastIncrement && (
        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          padding: '4px 10px', borderRadius: 6,
          background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)',
          fontSize: 11, fontWeight: 700, color: '#4ade80',
          animation: 'fadeIn 0.3s ease',
        }}>
          +{lastIncrement} blocked · +{formatGBP(lastIncrement * AVG_COST_PER_INCIDENT_GBP)} saved
        </div>
      )}
    </div>
  )
}

export default FinancialImpactCard
