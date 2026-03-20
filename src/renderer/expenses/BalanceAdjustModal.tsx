import { useState } from 'react'
import type { Wallet } from '../../shared/domain-types'

interface BalanceAdjustModalProps {
  wallet: Wallet
  onSave: (mode: 'set' | 'delta', amount: number) => void
  onClose: () => void
}

export function BalanceAdjustModal({ wallet, onSave, onClose }: BalanceAdjustModalProps) {
  const [mode, setMode] = useState<'set' | 'delta'>('set')
  const [value, setValue] = useState('')

  function handleSave() {
    const parsed = parseFloat(value)
    if (isNaN(parsed)) return
    const amountInCents = Math.round(parsed * 100)
    onSave(mode, amountInCents)
    onClose()
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <div
        style={{
          width: 300,
          backgroundColor: 'var(--color-bg-overlay)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-size-heading)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          Adjust {wallet.name}
        </span>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={() => setMode('set')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: 'var(--font-size-body)',
              fontWeight: mode === 'set' ? 600 : 400,
              color: mode === 'set' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              transition: 'color var(--duration-fast) ease-out',
            }}
          >
            Set balance
          </button>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body)' }}>
            /
          </span>
          <button
            onClick={() => setMode('delta')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: 'var(--font-size-body)',
              fontWeight: mode === 'delta' ? 600 : 400,
              color: mode === 'delta' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              transition: 'color var(--duration-fast) ease-out',
            }}
          >
            Add / Subtract
          </button>
        </div>

        {/* Amount input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span
            style={{
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
              userSelect: 'none',
            }}
          >
            ₱
          </span>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={mode === 'set' ? '0' : '0 or -0'}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') onClose()
            }}
            style={{
              flex: 1,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px var(--space-2)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-body)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border-focused)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px var(--space-2)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            style={{
              background: 'var(--color-accent)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '6px var(--space-4)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-body)',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
