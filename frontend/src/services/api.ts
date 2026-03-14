import axios from 'axios'

// ─────────────────────────────────────────────────────────
// API Service — All communication with the backend FastAPI
// Base URL auto-resolves via Vite proxy in dev
// ─────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request Interceptor (attach auth token if present) ──
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('fraud_api_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response Interceptor (global error handling) ──
client.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', err.response?.status, err.response?.data)
    return Promise.reject(err)
  }
)

// ─────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────

export interface ModuleScore {
  module_name: string
  risk_score: number       // 0–100
  confidence: number       // 0–100
  flags: string[]
  explanation: Record<string, number>
}

export interface ScanResult {
  scan_id: string
  timestamp: string
  unified_risk_score: number
  risk_tier: 'safe' | 'suspicious' | 'high_risk' | 'critical'
  recommended_action: 'monitor' | 'alert' | 'quarantine' | 'block'
  module_scores: ModuleScore[]
  processing_time_ms: number
}

export interface AlertRecord {
  id: string
  type: string
  risk_score: number
  risk_tier: string
  timestamp: string
  summary: string
}

export interface DashboardStats {
  total_scans: number
  threats_blocked: number
  average_risk_score: number
  active_modules: number
  recent_alerts: AlertRecord[]
}

// ─────────────────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────────────────

/** Scan email text or .eml file for phishing */
export const scanEmail = async (formData: FormData): Promise<ScanResult> => {
  const res = await client.post<ScanResult>('/email/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

/** Scan uploaded file for malicious attachment */
export const scanAttachment = async (formData: FormData): Promise<ScanResult> => {
  const res = await client.post<ScanResult>('/attachment/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

/** Scan a URL for website spoofing */
export const scanWebsite = async (url: string): Promise<ScanResult> => {
  const res = await client.post<ScanResult>('/website/scan', { url })
  return res.data
}

/** Scan audio file for deepfake voice */
export const scanVoice = async (formData: FormData): Promise<ScanResult> => {
  const res = await client.post<ScanResult>('/voice/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

/** Analyze prompt for injection attacks */
export const scanPrompt = async (prompt: string): Promise<ScanResult> => {
  const res = await client.post<ScanResult>('/prompt/scan', { prompt })
  return res.data
}

/** Check text/code for credential leaks */
export const scanCredentials = async (text: string): Promise<ScanResult> => {
  const res = await client.post<ScanResult>('/credential/scan', { text })
  return res.data
}

/** Run code/prompt in the isolated sandbox */
export const runSandbox = async (payload: string): Promise<ScanResult> => {
  const res = await client.post<ScanResult>('/sandbox/run', { payload })
  return res.data
}

/** Fetch dashboard statistics */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await client.get<DashboardStats>('/dashboard/stats')
  return res.data
}

/** Fetch recent alerts list */
export const getAlerts = async (limit = 20): Promise<AlertRecord[]> => {
  const res = await client.get<AlertRecord[]>(`/alerts?limit=${limit}`)
  return res.data
}

export default client
