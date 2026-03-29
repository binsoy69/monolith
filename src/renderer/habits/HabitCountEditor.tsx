import { useEffect, useState } from 'react'

interface HabitCountEditorProps {
  habitName: string
  value: number
  targetCount: number
  onApply: (value: number) => Promise<void> | void
}

function validateCountValue(rawValue: string): string | null {
  const trimmed = rawValue.trim()
  if (!trimmed) {
    return 'Enter a count before applying.'
  }

  if (!/^\d+$/.test(trimmed)) {
    return 'Count must be a non-negative whole number.'
  }

  return null
}

export function HabitCountEditor({ habitName, value, targetCount, onApply }: HabitCountEditorProps) {
  const [inputValue, setInputValue] = useState(String(value))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setInputValue(String(value))
  }, [value])

  const handleApply = async () => {
    const nextError = validateCountValue(inputValue)
    if (nextError) {
      setError(nextError)
      return
    }

    setError(null)
    await onApply(Number.parseInt(inputValue, 10))
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        padding: 'var(--space-3)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span
          style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Direct count entry
        </span>
        <span
          style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-text-muted)',
          }}
        >
          Set today&apos;s measured value for {habitName}. Target: {targetCount}.
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          alignItems: 'center',
        }}
      >
        <input
          aria-label={`Set count for ${habitName}`}
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value)
            if (error) {
              setError(null)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void handleApply()
            }
          }}
          style={{
            flex: 1,
            minWidth: 0,
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-size-body)',
            fontFamily: 'inherit',
          }}
        />
        <button
          type="button"
          onClick={() => void handleApply()}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-size-body)',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          Apply
        </button>
      </div>

      {error && (
        <span
          role="alert"
          style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-destructive)',
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
}
