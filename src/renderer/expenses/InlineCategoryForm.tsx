import { useState } from 'react'
import { X } from 'lucide-react'

const PRESET_COLORS = [
  '#f97316', // orange
  '#3b82f6', // blue
  '#ef4444', // red
  '#a855f7', // purple
  '#ec4899', // pink
  '#22c55e', // green
  '#6b7280', // gray
  '#eab308', // yellow
  '#14b8a6', // teal
  '#8b5cf6', // violet
  '#f43f5e', // rose
  '#06b6d4', // cyan
]

interface InlineCategoryFormProps {
  onSave: (data: { name: string; color: string }) => void
  onCancel: () => void
}

export function InlineCategoryForm({ onSave, onCancel }: InlineCategoryFormProps) {
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  function handleSave() {
    if (!name.trim() || !selectedColor) return
    onSave({ name: name.trim(), color: selectedColor })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div
      style={{
        padding: 'var(--space-2) var(--space-4)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Category name"
          style={{
            flex: 1,
            height: '28px',
            background: 'var(--color-bg-base)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-size-small)',
            padding: '0 var(--space-2)',
            outline: 'none',
          }}
          onFocus={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-focused)'
          }}
          onBlur={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
          }}
        />
        <button
          onClick={onCancel}
          title="Cancel"
          style={{
            background: 'none',
            border: 'none',
            padding: '2px',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'
          }}
        >
          <X size={12} />
        </button>
      </div>

      {/* Color palette */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: 'var(--space-2)' }}>
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            title={color}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: color,
              border: selectedColor === color ? '2px solid white' : '2px solid transparent',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
              outline: 'none',
            }}
          />
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={!name.trim() || !selectedColor}
        style={{
          fontSize: 'var(--font-size-small)',
          color: !name.trim() || !selectedColor ? 'var(--color-text-muted)' : 'var(--color-accent)',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: !name.trim() || !selectedColor ? 'default' : 'pointer',
        }}
      >
        Add
      </button>
    </div>
  )
}
