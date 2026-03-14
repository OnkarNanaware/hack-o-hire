import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// ─────────────────────────────────────────────────────────
// RiskScoreCard Component
// Displays unified risk score with animated gauge ring
// ─────────────────────────────────────────────────────────

interface RiskScoreCardProps {
  score: number           // 0–100
  tier: 'safe' | 'suspicious' | 'high_risk' | 'critical'
  action: string
  isLoading?: boolean
  trend?: 'up' | 'down' | 'stable'
}

const TIER_CONFIG = {
  safe: { color: '#22c55e', label: 'SAFE', glow: 'rgba(34,197,94,0.4)' },
  suspicious: { color: '#eab308', label: 'SUSPICIOUS', glow: 'rgba(234,179,8,0.4)' },
  high_risk: { color: '#f97316', label: 'HIGH RISK', glow: 'rgba(249,115,22,0.4)' },
  critical: { color: '#ef4444', label: 'CRITICAL', glow: 'rgba(239,68,68,0.4)' },
}

const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  score, tier, action, isLoading = false, trend = 'stable'
}) => {
  const config = TIER_CONFIG[tier]
  const circumference = 2 * Math.PI * 54  // radius = 54
  const dashOffset = circumference - (score / 100) * circumference

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? '#ef4444' : trend === 'down' ? '#22c55e' : '#8ba3c8'

  if (isLoading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Analyzing...</p>
      </div>
    )
  }

  return (
    <div className="card animate-fade-in" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 24,
        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Unified Risk Score
      </div>

      {/* SVG Gauge Ring */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
        <svg width={140} height={140} viewBox="0 0 140 140">
          {/* Background track */}
          <circle
            cx={70} cy={70} r={54}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={10}
          />
          {/* Score arc */}
          <circle
            cx={70} cy={70} r={54}
            fill="none"
            stroke={config.color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 70 70)"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)',
              filter: `drop-shadow(0 0 8px ${config.glow})`,
            }}
          />
        </svg>

        {/* Score number overlay */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 38, fontWeight: 800, lineHeight: 1,
            color: config.color,
            textShadow: `0 0 20px ${config.glow}`,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {score}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>/100</div>
        </div>
      </div>

      {/* Tier badge */}
      <div>
        <span className={`risk-badge risk-${tier === 'high_risk' ? 'high' : tier}`}>
          {config.label}
        </span>
      </div>

      {/* Action */}
      <div style={{
        marginTop: 16, padding: '8px 16px',
        background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)',
        fontSize: 12, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>Recommended Action</span>
        <span style={{ fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.05em', color: config.color, fontSize: 12 }}>
          {action}
        </span>
      </div>

      {/* Trend */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 6, fontSize: 12, color: trendColor }}>
        <TrendIcon size={14} />
        <span>{trend === 'up' ? 'Risk increasing' : trend === 'down' ? 'Risk decreasing' : 'Stable'}</span>
      </div>
    </div>
  )
}

export default RiskScoreCard
