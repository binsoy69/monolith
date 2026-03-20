import { useState, useEffect, useRef } from 'react'
import { DayPicker } from './DayPicker'

/**
 * HabitForm — Inline expandable form for creating or editing a habit.
 * Renders at the top of the card list with a name input and DayPicker.
 * Shared between create and edit modes (edit pre-fills values).
 */

interface HabitFormProps {
  mode: 'create' | 'edit'
  initialName?: string
  initialDaysOfWeek?: string
  onSubmit: (data: { name: string; daysOfWeek: string }) => void
  onCancel: () => void
}

const DEFAULT_DAYS = '1111111' // Every day by default for new habits

export function HabitForm({
  mode,
  initialName = '',
  initialDaysOfWeek = DEFAULT_DAYS,
  onSubmit,
  onCancel,
}: HabitFormProps) {
  const [name, setName] = useState(initialName)
  const [daysOfWeek, setDaysOfWeek] = useState(initialDaysOfWeek)
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus name input on mount
  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  // Escape key cancels form
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

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit({ name: trimmed, daysOfWeek })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const submitLabel = mode === 'create' ? 'Create Habit' : 'Save Changes'

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        // Animate open: max-height transition
        maxHeight: '200px',
        overflow: 'hidden',
        transition: `max-height var(--duration-normal) ease-out`,
      }}
    >
      {/* Name input */}
      <input
        ref={nameInputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Habit name"
        style={{
          width: '100%',
          height: '32px',
          backgroundColor: 'var(--color-bg-base)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-body)',
          fontFamily: 'inherit',
          color: 'var(--color-text-primary)',
          padding: '0 var(--space-2)',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border-focused)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)'
        }}
      />

      {/* Day picker */}
      <DayPicker selectedDays={daysOfWeek} onChange={setDaysOfWeek} />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
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
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-small)',
            fontFamily: 'inherit',
            cursor: 'pointer',
            padding: 'var(--space-1) var(--space-2)',
            opacity: name.trim() ? 1 : 0.5,
          }}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
