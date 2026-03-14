import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import EmailScanner from './pages/EmailScanner'
import AttachmentScanner from './pages/AttachmentScanner'
import WebsiteScanner from './pages/WebsiteScanner'
import VoiceDetector from './pages/VoiceDetector'
import PromptInjectionAnalyzer from './pages/PromptInjectionAnalyzer'

// ─────────────────────────────────────────────────────────
// App Root — Router + Shell Layout
// ─────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/email" element={<EmailScanner />} />
            <Route path="/attachment" element={<AttachmentScanner />} />
            <Route path="/website" element={<WebsiteScanner />} />
            <Route path="/voice" element={<VoiceDetector />} />
            <Route path="/prompt" element={<PromptInjectionAnalyzer />} />
            {/* Placeholder routes — implement later */}
            <Route path="/sandbox" element={
              <PlaceholderPage title="Agent Sandbox Monitor" emoji="🤖"
                desc="Isolated Docker sandbox execution monitor with syscall tracing and behavior analysis." />
            } />
            <Route path="/analytics" element={
              <PlaceholderPage title="Analytics" emoji="📊"
                desc="Risk trends, attack distribution, and fraud statistics across all modules." />
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

// Simple placeholder for unimplemented pages
const PlaceholderPage: React.FC<{ title: string; emoji: string; desc: string }> = ({ title, emoji, desc }) => (
  <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div className="card" style={{ textAlign: 'center', maxWidth: 480, padding: '60px 40px' }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>{emoji}</div>
      <h2 style={{ fontSize: 22, marginBottom: 12 }}>{title}</h2>
      <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{desc}</p>
      <div style={{ marginTop: 24, padding: '8px 16px', borderRadius: 8, display: 'inline-block',
        background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
        fontSize: 12, color: 'var(--color-accent-cyan)', fontFamily: 'var(--font-mono)' }}>
        // TODO: Implement this module
      </div>
    </div>
  </div>
)

export default App
