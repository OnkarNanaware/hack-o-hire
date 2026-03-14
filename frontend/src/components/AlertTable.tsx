import React from 'react'
import { AlertTriangle, ShieldX, Eye, Lock, ExternalLink } from 'lucide-react'
import type { AlertRecord } from '../services/api'

// ─────────────────────────────────────────────────────────
// AlertTable Component
// Displays recent fraud detection alerts
// ─────────────────────────────────────────────────────────

interface AlertTableProps {
  alerts: AlertRecord[]
  isLoading?: boolean
  maxRows?: number
}

const TIER_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  critical: ShieldX,
  high_risk: AlertTriangle,
  suspicious: Eye,
  safe: Lock,
}

const AlertTable: React.FC<AlertTableProps> = ({ alerts, isLoading = false, maxRows = 10 }) => {
  const displayAlerts = alerts.slice(0, maxRows)

  const getTierClass = (tier: string) => {
    switch (tier) {
      case 'critical': return 'risk-critical'
      case 'high_risk': return 'risk-high'
      case 'suspicious': return 'risk-suspicious'
      default: return 'risk-safe'
    }
  }

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Loading alerts...</p>
      </div>
    )
  }

  if (displayAlerts.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <Lock size={32} color="var(--color-text-muted)" style={{ marginBottom: 12 }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>No alerts detected</p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 4 }}>
          All systems clear
        </p>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Recent Alerts</span>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {alerts.length} total
        </span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Summary</th>
              <th>Risk Score</th>
              <th>Tier</th>
              <th>Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayAlerts.map((alert) => {
              const TierIcon = TIER_ICONS[alert.risk_tier] ?? Eye
              return (
                <tr key={alert.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TierIcon size={14} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {alert.type}
                      </span>
                    </div>
                  </td>
                  <td style={{ maxWidth: 280, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    color: 'var(--color-text-secondary)', fontSize: 13 }}>
                    {alert.summary}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="score-bar-track" style={{ width: 60 }}>
                        <div
                          className="score-bar-fill"
                          style={{
                            width: `${alert.risk_score}%`,
                            background: alert.risk_score > 75 ? '#ef4444'
                              : alert.risk_score > 50 ? '#f97316'
                              : alert.risk_score > 20 ? '#eab308' : '#22c55e'
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13,
                        fontVariantNumeric: 'tabular-nums', minWidth: 28 }}>
                        {alert.risk_score}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`risk-badge ${getTierClass(alert.risk_tier)}`}>
                      {alert.risk_tier.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                    {formatTime(alert.timestamp)}
                  </td>
                  <td>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--color-text-muted)', padding: 4 }}>
                      <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AlertTable
