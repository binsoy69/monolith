import { useState, useRef } from 'react'
import type { RefObject } from 'react'
import { Calendar } from 'lucide-react'

interface QuickAddInputProps {
  date: string
  onAdd: (title: string, date: string) => void
  inputRef?: RefObject<HTMLInputElement | null>
}

export function QuickAddInput({ date, onAdd, inputRef }: QuickAddInputProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [selectedDate, setSelectedDate] = useState(date)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onAdd(value.trim(), selectedDate)
      setValue('')
      setSelectedDate(date)
    }
  }

  const handleCalendarClick = () => {
    dateInputRef.current?.showPicker()
  }

  // Keep selectedDate in sync when viewDate changes
  if (selectedDate !== date && value === '') {
    setSelectedDate(date)
  }

  return (
    <div style={{ position: 'relative', marginBottom: 'var(--space-2)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '32px',
          backgroundColor: 'var(--color-bg-elevated)',
          border: `1px solid ${isFocused ? 'var(--color-border-focused)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-sm)',
          paddingLeft: 'var(--space-2)',
          paddingRight: 'var(--space-2)',
          gap: 'var(--space-1)',
          transition: `border-color var(--duration-fast) ease-out`,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Add a task..."
          style={{
            flex: 1,
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-text-primary)',
            fontFamily: 'inherit',
          }}
        />
        <button
          type="button"
          onClick={handleCalendarClick}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-text-muted)',
            flexShrink: 0,
          }}
          aria-label="Pick date"
        >
          <Calendar size={14} strokeWidth={1.5} />
        </button>
      </div>
      <input
        ref={dateInputRef}
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        style={{
          position: 'absolute',
          opacity: 0,
          width: '1px',
          height: '1px',
          bottom: 0,
          right: 0,
          pointerEvents: 'none',
        }}
        tabIndex={-1}
      />
    </div>
  )
}
