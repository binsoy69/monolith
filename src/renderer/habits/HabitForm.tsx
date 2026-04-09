import { useEffect, useRef, useState } from 'react'
import type { HabitKind } from '../../shared/domain-types'
import { DayPicker } from './DayPicker'

interface HabitFormProps {
  mode: 'create' | 'edit'
  initialName?: string
  initialDaysOfWeek?: string
  initialKind?: HabitKind
  initialTargetCount?: number | null
  onSubmit: (data: { name: string; daysOfWeek: string; kind: HabitKind; targetCount: number | null }) => void
  onCancel: () => void
}

const DEFAULT_DAYS = '1111111'

export function HabitForm({
  mode,
  initialName = '',
  initialDaysOfWeek = DEFAULT_DAYS,
  initialKind = 'boolean',
  initialTargetCount = null,
  onSubmit,
  onCancel,
}: HabitFormProps) {
  const [name, setName] = useState(initialName)
  const [daysOfWeek, setDaysOfWeek] = useState(initialDaysOfWeek)
  const [kind, setKind] = useState<HabitKind>(initialKind)
  const [targetCount, setTargetCount] = useState(
    initialTargetCount === null ? '1' : String(initialTargetCount)
  )
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setName(initialName)
    setDaysOfWeek(initialDaysOfWeek)
    setKind(initialKind)
    setTargetCount(initialTargetCount === null ? '1' : String(initialTargetCount))
  }, [initialDaysOfWeek, initialKind, initialName, initialTargetCount, mode])

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [initialName, mode])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  const parsedTarget = Number.parseInt(targetCount, 10)
  const targetIsValid = kind === 'boolean' || (Number.isInteger(parsedTarget) && parsedTarget >= 1)
  const canSubmit = Boolean(name.trim()) && targetIsValid

  const handleSubmit = () => {
    if (!canSubmit) {
      return
    }

    onSubmit({
      name: name.trim(),
      daysOfWeek,
      kind,
      targetCount: kind === 'count' ? parsedTarget : null,
    })
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
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
        gap: 'var(--space-3)',
        flexShrink: 0,
      }}
    >
      <input
        ref={nameInputRef}
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={handleInputKeyDown}
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
        onFocus={(event) => {
          event.currentTarget.style.borderColor = 'var(--color-border-focused)'
        }}
        onBlur={(event) => {
          event.currentTarget.style.borderColor = 'var(--color-border)'
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <span
          style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Type
        </span>
        <div
          style={{
            display: 'inline-flex',
            width: 'fit-content',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
          }}
        >
          {(['boolean', 'count'] as HabitKind[]).map((option) => {
            const isActive = kind === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setKind(option)
                  if (option === 'count' && (!Number.isInteger(parsedTarget) || parsedTarget < 1)) {
                    setTargetCount('1')
                  }
                }}
                style={{
                  backgroundColor: isActive ? 'var(--color-accent-subtle)' : 'transparent',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  border: 'none',
                  padding: 'var(--space-2) var(--space-4)',
                  fontSize: 'var(--font-size-body)',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {option === 'boolean' ? 'Boolean' : 'Count'}
              </button>
            )
          })}
        </div>
      </div>

      {kind === 'count' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <label
            htmlFor="habit-target-count"
            style={{
              fontSize: 'var(--font-size-small)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Count target
          </label>
          <input
            id="habit-target-count"
            type="number"
            min={1}
            step={1}
            value={targetCount}
            onChange={(event) => setTargetCount(event.target.value)}
            onKeyDown={handleInputKeyDown}
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
          />
        </div>
      )}

      <DayPicker selectedDays={daysOfWeek} onChange={setDaysOfWeek} />

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
          disabled={!canSubmit}
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-body)',
            fontFamily: 'inherit',
            cursor: 'pointer',
            padding: 'var(--space-1) var(--space-2)',
            opacity: canSubmit ? 1 : 0.5,
          }}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
