import { useState } from 'react'

/**
 * DayPicker — Row of 7 toggle buttons for selecting days of the week.
 *
 * `selectedDays` is a 7-char bitmask string where:
 *   index 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 *
 * Visually ordered Mon-Sun (indices 1,2,3,4,5,6,0).
 */

interface DayPickerProps {
  selectedDays: string
  onChange: (daysOfWeek: string) => void
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
// Bitmask indices in visual order: Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=0
const DAY_INDICES = [1, 2, 3, 4, 5, 6, 0]

export function DayPicker({ selectedDays, onChange }: DayPickerProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 'var(--space-1)',
      }}
    >
      {DAY_LABELS.map((label, visualIdx) => {
        const bitIndex = DAY_INDICES[visualIdx]
        const isSelected = selectedDays[bitIndex] === '1'

        return (
          <DayButton
            key={label}
            label={label}
            isSelected={isSelected}
            onToggle={() => {
              // Toggle the bit at bitIndex
              const chars = selectedDays.split('')
              chars[bitIndex] = isSelected ? '0' : '1'
              onChange(chars.join(''))
            }}
          />
        )
      })}
    </div>
  )
}

interface DayButtonProps {
  label: string
  isSelected: boolean
  onToggle: () => void
}

function DayButton({ label, isSelected, onToggle }: DayButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  let backgroundColor: string
  let color: string
  let border: string

  if (isSelected) {
    backgroundColor = 'var(--color-accent)'
    color = 'white'
    border = '1px solid var(--color-accent)'
  } else if (isHovered) {
    backgroundColor = 'var(--color-bg-subtle)'
    color = 'var(--color-text-secondary)'
    border = '1px solid var(--color-border)'
  } else {
    backgroundColor = 'transparent'
    color = 'var(--color-text-secondary)'
    border = '1px solid var(--color-border)'
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '36px',
        height: '28px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--font-size-small)',
        fontFamily: 'inherit',
        backgroundColor,
        color,
        border,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: `background-color var(--duration-fast) ease-out, color var(--duration-fast) ease-out`,
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  )
}
