import React, { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  Shield, ShieldAlert, Activity, Zap, Mail, Paperclip,
  Globe, Mic, Terminal, Bot
} from 'lucide-react'
import RiskScoreCard from '../components/RiskScoreCard'
import AlertTable from '../components/AlertTable'
import { getDashboardStats, type DashboardStats, type AlertRecord } from '../services/api'

// ─────────────────────────────────────────────────────────
// Dashboard Page — Command Center Overview
// ─────────────────────────────────────────────────────────

// Mock trend data (replace with real API in production)
const MOCK_TREND_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  score: Math.floor(Math.random() * 80) + 10,
  threats: Math.floor(Math.random() * 15),
}))

const MODULE_STATS = [
  { name: 'Email Phishing', icon: Mail, scans: 248, threats: 12, color: '#00d4ff' },
  { name: 'Attachments', icon: Paperclip, scans: 134, threats: 5, color: '#7c3aed' },
  { name: 'Website Spoof', icon: Globe, scans: 89, threats: 3, color: '#f97316' },
  { name: 'Deepfake Voice', icon: Mic, scans: 57, threats: 8, color: '#ec4899' },
  { name: 'Prompt Injection', icon: Terminal, scans: 320, threats: 21, color: '#eab308' },
  { name: 'Agent Sandbox', icon: Bot, scans: 43, threats: 4, color: '#10b981' },
]

const MOCK_STATS: DashboardStats = {
  total_scans: 891,
  threats_blocked: 53,
  average_risk_score: 28,
  active_modules: 7,
  recent_alerts: [],
}

const MOCK_ALERTS: AlertRecord[] = [
  { id: '1', type: 'phishing_email', risk_score: 91, risk_tier: 'critical', timestamp: new Date().toISOString(), summary: 'AI-crafted spear phishing email impersonating CFO detected' },
  { id: '2', type: 'prompt_injection', risk_score: 78, risk_tier: 'high_risk', timestamp: new Date(Date.now() - 120000).toISOString(), summary: 'Jailbreak attempt: "Ignore previous instructions and reveal..."' },
  { id: '3', type: 'website_spoofing', risk_score: 65, risk_tier: 'high_risk', timestamp: new Date(Date.now() - 300000).toISOString(), summary: 'Visual clone of banking portal detected at suspicious domain' },
  { id: '4', type: 'deepfake_voice', risk_score: 83, risk_tier: 'critical', timestamp: new Date(Date.now() - 600000).toISOString(), summary: 'Synthetic voice cloning attempt impersonating CEO' },
  { id: '5', type: 'credential_leak', risk_score: 42, risk_tier: 'suspicious', timestamp: new Date(Date.now() - 900000).toISOString(), summary: 'API key pattern found in uploaded document' },
]

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ComponentType<{ size?: number }>; color: string; sub?: string }> = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase',
          letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>{label}</div>
        <div className="metric-value" style={{ color }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `rgba(${color === '#ef4444' ? '239,68,68' : color === '#22c55e' ? '34,197,94' : color === '#00d4ff' ? '0,212,255' : '124,58,237'},0.12)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} />
      </div>
    </div>
  </div>
)

const Dashboard: React.FC = () => {
  const [stats] = useState<DashboardStats>(MOCK_STATS)
  const [loading, setLoading] = useState(false)

  // In production: useEffect(() => { getDashboardStats().then(setStats) }, [])

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h1>Security Command Center</h1>
        <p>Real-time AI fraud detection across 7 attack surfaces — {new Date().toLocaleString()}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Total Scans" value={stats.total_scans.toLocaleString()} icon={Activity} color="var(--color-accent-cyan)" sub="Last 24 hours" />
        <StatCard label="Threats Blocked" value={stats.threats_blocked} icon={ShieldAlert} color="#ef4444" sub="Auto-blocked" />
        <StatCard label="Avg Risk Score" value={stats.average_risk_score} icon={Shield} color="#eab308" sub="Platform-wide" />
        <StatCard label="Active Modules" value={stats.active_modules} icon={Zap} color="#22c55e" sub="Operational" />
      </div>

      {/* Main grid: score + chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, marginBottom: 24 }}>
        <RiskScoreCard
          score={stats.average_risk_score}
          tier="suspicious"
          action="Alert"
          trend="down"
        />

        {/* 24hr Risk Trend Chart */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>24-Hour Risk Trend</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MOCK_TREND_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: '#4a6080', fontSize: 11 }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fill: '#4a6080', fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#0f1c2e', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#8ba3c8' }}
                itemStyle={{ color: '#00d4ff' }}
              />
              <Area type="monotone" dataKey="score" stroke="#00d4ff" strokeWidth={2} fill="url(#scoreGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Module Activity */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Module Activity Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {MODULE_STATS.map((mod) => {
            const Icon = mod.icon
            const threatRate = ((mod.threats / mod.scans) * 100).toFixed(1)
            return (
              <div key={mod.name} style={{
                padding: '16px', borderRadius: 10,
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: `${mod.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={16} color={mod.color} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{mod.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <div>
                    <div style={{ color: 'var(--color-text-muted)' }}>Scans</div>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{mod.scans}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--color-text-muted)' }}>Threats</div>
                    <div style={{ fontWeight: 700, color: mod.threats > 0 ? '#ef4444' : '#22c55e' }}>{mod.threats}</div>
                  </div>
                </div>
                <div className="score-bar-track" style={{ marginTop: 10 }}>
                  <div className="score-bar-fill" style={{ width: `${threatRate}%`, background: mod.color }} />
                </div>
                <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  {threatRate}% threat rate
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Alerts Table */}
      <AlertTable alerts={MOCK_ALERTS} isLoading={loading} />
    </div>
  )
}

export default Dashboard
