import React, { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import {
  Shield, ShieldAlert, Activity, Zap, Mail, Paperclip,
  Globe, Mic, Terminal, Bot
} from 'lucide-react'
import RiskScoreCard from '../components/RiskScoreCard'
import AlertTable from '../components/AlertTable'
import LiveThreatFeed from '../components/LiveThreatFeed'
import FinancialImpactCard from '../components/FinancialImpactCard'
import type { DashboardStats, AlertRecord } from '../services/api'

// ─────────────────────────────────────────────────────────
// Dashboard Page — Command Center Overview
// ─────────────────────────────────────────────────────────

const MOCK_TREND_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  score: Math.floor(Math.random() * 70) + 10,
  threats: Math.floor(Math.random() * 15),
}))

const ATTACK_DIST = [
  { name: 'Phishing', value: 35, color: '#00d4ff' },
  { name: 'Malware', value: 22, color: '#7c3aed' },
  { name: 'Spoofing', value: 14, color: '#f97316' },
  { name: 'Deepfake', value: 12, color: '#ec4899' },
  { name: 'Injection', value: 10, color: '#eab308' },
  { name: 'Sandbox', value: 7, color: '#10b981' },
]

const MODULE_STATS = [
  { name: 'Email Phishing', icon: Mail, scans: 248, threats: 12, color: '#00d4ff' },
  { name: 'Attachments', icon: Paperclip, scans: 134, threats: 5, color: '#7c3aed' },
  { name: 'Website Spoof', icon: Globe, scans: 89, threats: 3, color: '#f97316' },
  { name: 'Deepfake Voice', icon: Mic, scans: 57, threats: 8, color: '#ec4899' },
  { name: 'Prompt Injection', icon: Terminal, scans: 320, threats: 21, color: '#eab308' },
  { name: 'Agent Sandbox', icon: Bot, scans: 43, threats: 4, color: '#10b981' },
]

const MOCK_STATS: DashboardStats = {
  total_scans: 891, threats_blocked: 53,
  average_risk_score: 28, active_modules: 7, recent_alerts: [],
}

const MOCK_ALERTS: AlertRecord[] = [
  { id: '1', type: 'phishing_email', risk_score: 91, risk_tier: 'critical', timestamp: new Date().toISOString(), summary: 'AI-crafted spear phishing email impersonating CFO detected' },
  { id: '2', type: 'prompt_injection', risk_score: 78, risk_tier: 'high_risk', timestamp: new Date(Date.now() - 120000).toISOString(), summary: 'Jailbreak attempt: "Ignore previous instructions and reveal..."' },
  { id: '3', type: 'website_spoofing', risk_score: 65, risk_tier: 'high_risk', timestamp: new Date(Date.now() - 300000).toISOString(), summary: 'Visual clone of banking portal at barclays-verify.tk' },
  { id: '4', type: 'deepfake_voice', risk_score: 83, risk_tier: 'critical', timestamp: new Date(Date.now() - 600000).toISOString(), summary: 'Synthetic voice cloning attempt impersonating CEO' },
  { id: '5', type: 'credential_leak', risk_score: 42, risk_tier: 'suspicious', timestamp: new Date(Date.now() - 900000).toISOString(), summary: 'AWS API key pattern found in uploaded document' },
]

const StatCard: React.FC<{
  label: string; value: string | number
  icon: React.ComponentType<{ size?: number }>; color: string; sub?: string
}> = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase',
          letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>{label}</div>
        <div className="metric-value" style={{ color }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} />
      </div>
    </div>
  </div>
)

const Dashboard: React.FC = () => {
  const [stats] = useState<DashboardStats>(MOCK_STATS)

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h1>Security Command Center</h1>
        <p>Real-time AI fraud detection across 7 attack surfaces — {new Date().toLocaleString()}</p>
      </div>

      {/* KPI Row */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <StatCard label="Total Scans" value={stats.total_scans.toLocaleString()} icon={Activity} color="var(--color-accent-cyan)" sub="Last 24 hours" />
        <StatCard label="Threats Blocked" value={stats.threats_blocked} icon={ShieldAlert} color="#ef4444" sub="Auto-blocked" />
        <StatCard label="Avg Risk Score" value={stats.average_risk_score} icon={Shield} color="#eab308" sub="Platform-wide" />
        <StatCard label="Active Modules" value={stats.active_modules} icon={Zap} color="#22c55e" sub="Operational" />
      </div>

      {/* Row 2: Risk Score + Trend + Financial Impact */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 300px', gap: 20, marginBottom: 20 }}>
        <RiskScoreCard score={stats.average_risk_score} tier="suspicious" action="Alert" trend="down" />

        {/* 24hr Risk Trend */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>24-Hour Risk Trend</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={MOCK_TREND_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fill: '#4a6080', fontSize: 10 }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fill: '#4a6080', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#0f1c2e', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: '#8ba3c8' }} itemStyle={{ color: '#00d4ff' }}
              />
              <Area type="monotone" dataKey="score" stroke="#00d4ff" strokeWidth={2} fill="url(#scoreGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Financial Impact */}
        <FinancialImpactCard />
      </div>

      {/* Row 3: Attack Distribution + Module Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, marginBottom: 20 }}>
        {/* Attack Distribution Chart */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Attack Distribution</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ATTACK_DIST} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <XAxis type="number" tick={{ fill: '#4a6080', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#8ba3c8', fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
              <Tooltip
                contentStyle={{ background: '#0f1c2e', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 11 }}
                cursor={{ fill: 'rgba(0,212,255,0.04)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {ATTACK_DIST.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Module Activity Grid */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Module Activity</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {MODULE_STATS.map((mod) => {
              const Icon = mod.icon
              const threatRate = ((mod.threats / mod.scans) * 100).toFixed(1)
              return (
                <div key={mod.name} style={{
                  padding: '12px', borderRadius: 8,
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                      background: `${mod.color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Icon size={14} color={mod.color} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 12, lineHeight: 1.2 }}>{mod.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{mod.scans} scans</span>
                    <span style={{ fontWeight: 700, color: mod.threats > 0 ? '#ef4444' : '#22c55e' }}>
                      {mod.threats} threats
                    </span>
                  </div>
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{ width: `${threatRate}%`, background: mod.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Row 4: Live Threat Feed + Recent Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <LiveThreatFeed />
        <AlertTable alerts={MOCK_ALERTS} />
      </div>
    </div>
  )
}

export default Dashboard
