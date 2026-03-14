import React, { useCallback, useState } from 'react'
import { Upload, FileCheck, AlertCircle, X } from 'lucide-react'

// ─────────────────────────────────────────────────────────
// UploadPanel Component
// Drag-and-drop file upload with preview and validation
// ─────────────────────────────────────────────────────────

interface UploadPanelProps {
  title: string
  description: string
  acceptedTypes: string[]     // e.g. ['.eml', '.txt'] or ['audio/*']
  maxSizeMb?: number
  onFileSelected: (file: File) => void
  onClear?: () => void
  isLoading?: boolean
}

const UploadPanel: React.FC<UploadPanelProps> = ({
  title, description, acceptedTypes, maxSizeMb = 25,
  onFileSelected, onClear, isLoading = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateAndSelect = (file: File) => {
    setError(null)
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMb}MB limit`)
      return
    }
    setSelectedFile(file)
    onFileSelected(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndSelect(file)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSelect(file)
  }

  const handleClear = () => {
    setSelectedFile(null)
    setError(null)
    onClear?.()
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  if (selectedFile) {
    return (
      <div className="card animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <FileCheck size={24} color="var(--color-accent-cyan)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedFile.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              {formatSize(selectedFile.size)} · {selectedFile.type || 'Unknown type'}
            </div>
          </div>
          {!isLoading && (
            <button onClick={handleClear} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', padding: 4            }}>
              <X size={18} />
            </button>
          )}
          {isLoading && <div className="spinner" />}
        </div>
      </div>
    )
  }

  return (
    <div>
      <label
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        htmlFor="file-input"
        style={{ display: 'block', cursor: 'pointer' }}
      >
        <input
          id="file-input"
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Upload size={24} color="var(--color-accent-cyan)" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)' }}>
              {title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {description}
            </div>
          </div>
          <div style={{
            fontSize: 12, color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)', letterSpacing: '0.02em'
          }}>
            Max {maxSizeMb}MB · {acceptedTypes.join(', ')}
          </div>
        </div>
      </label>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10,
          padding: '10px 14px', borderRadius: 8,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          fontSize: 13, color: '#f87171' }}>
          <AlertCircle size={15} />
          {error}
        </div>
      )}
    </div>
  )
}

export default UploadPanel
