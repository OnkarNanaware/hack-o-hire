import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Mail, Paperclip, Globe, Mic, Terminal,
  Bot, BarChart3, Shield, ChevronRight, Zap
} from 'lucide-react'

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ size?: number; color?: string }>
  badge?: string
  highlight?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/redteam', label: 'Red Team Simulator', icon: Zap, badge: 'DEMO', highlight: true },
  { path: '/email', label: 'Email Scanner', icon: Mail },
  { path: '/attachment', label: 'Attachments', icon: Paperclip },
  { path: '/website', label: 'Website Spoof', icon: Globe },
  { path: '/voice', label: 'Voice Deepfake', icon: Mic },
  { path: '/prompt', label: 'Prompt Injection', icon: Terminal },
  { path: '/sandbox', label: 'Agent Sandbox', icon: Bot, badge: 'Beta' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
]

const Navbar: React.FC = () => {
  const location = useLocation()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple))',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              FraudSentinel
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
              AI DETECTION v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>
          Platform
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '9px 10px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                color: item.highlight && !isActive
                  ? '#f97316'
                  : isActive ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)',
                background: isActive
                  ? 'rgba(0,212,255,0.08)'
                  : item.highlight ? 'rgba(249,115,22,0.06)' : 'transparent',
                border: isActive
                  ? '1px solid rgba(0,212,255,0.15)'
                  : item.highlight ? '1px solid rgba(249,115,22,0.2)' : '1px solid transparent',
                transition: 'all var(--transition-fast)',
                marginBottom: 2,
              }}
            >
              <Icon size={15} color={item.highlight && !isActive ? '#f97316' : undefined} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 5px',
                  background: item.highlight ? 'rgba(249,115,22,0.2)' : 'rgba(124,58,237,0.2)',
                  color: item.highlight ? '#fb923c' : '#a78bfa',
                  borderRadius: 4,
                  border: `1px solid ${item.highlight ? 'rgba(249,115,22,0.3)' : 'rgba(124,58,237,0.3)'}`,
                }}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight size={13} />}
            </NavLink>
          )
        })}
      </nav>

      {/* Status Footer */}
      <div style={{
        padding: '12px 16px', borderTop: '1px solid var(--color-border)',
        fontSize: 11, color: 'var(--color-text-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: 'var(--color-safe)',
            boxShadow: '0 0 6px var(--color-safe)',
          }} />
          <span>All systems operational</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          7 modules · Barclays Bank PLC
        </div>
      </div>
    </aside>
  )
}

export default Navbar
