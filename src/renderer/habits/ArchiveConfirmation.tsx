import { useEffect } from 'react'

/**
 * ArchiveConfirmation — Inline prompt that replaces a HabitCard temporarily.
 * Shows archive confirmation with Confirm / Keep Habit buttons.
 * Same card dimensions as HabitCard for seamless swap.
 */

interface ArchiveConfirmationProps {
  habitName: string
  onConfirm: () => void
  onCancel: () => void
}

export function ArchiveConfirmation({ habitName, onConfirm, onCancel }: ArchiveConfirmationProps) {
  // Escape key cancels (but Escape is also handled by KeyboardRouter/HabitForm —
  // we use capture phase to intercept before HabitForm's Escape handler)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: '12px var(--space-4)',
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      {/* Confirmation message */}
      <span
        style={{
          flex: 1,
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-text-primary)',
        }}
      >
        Archive &ldquo;{habitName}&rdquo;? This habit will be hidden from today&rsquo;s view.
      </span>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onConfirm}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-destructive)',
            cursor: 'pointer',
            padding: 'var(--space-1) var(--space-2)',
            fontFamily: 'inherit',
          }}
        >
          Archive
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: 'var(--space-1) var(--space-2)',
            fontFamily: 'inherit',
          }}
        >
          Keep Habit
        </button>
      </div>
    </div>
  )
}
