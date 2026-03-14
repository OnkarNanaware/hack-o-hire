import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Mail, Paperclip, Globe, Mic, Terminal,
  Bot, BarChart3, Shield, ChevronRight
} from 'lucide-react'

// ─────────────────────────────────────────────────────────
// Navbar / Sidebar Component
// ─────────────────────────────────────────────────────────

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
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
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple))',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              FraudSentinel
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>
              AI DETECTION v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>
          Detection Modules
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 14, fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-accent-cyan)' : 'var(--color-text-secondary)',
                background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(0,212,255,0.15)' : '1px solid transparent',
                transition: 'all var(--transition-fast)',
                marginBottom: 2,
              }}
            >
              <Icon size={16} className={isActive ? '' : ''} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 6px',
                  background: 'rgba(124, 58, 237, 0.2)', color: '#a78bfa',
                  borderRadius: 4, border: '1px solid rgba(124,58,237,0.3)'
                }}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight size={14} />}
            </NavLink>
          )
        })}
      </nav>

      {/* Status Footer */}
      <div style={{
        padding: '16px 20px', borderTop: '1px solid var(--color-border)',
        fontSize: 12, color: 'var(--color-text-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--color-safe)',
            boxShadow: '0 0 6px var(--color-safe)',
          }} />
          <span>All systems operational</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 11, color: 'var(--color-text-muted)' }}>
          7 modules active
        </div>
      </div>
    </aside>
  )
}

export default Navbar
