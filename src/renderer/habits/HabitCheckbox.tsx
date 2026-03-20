import { Check } from 'lucide-react'

interface HabitCheckboxProps {
  checked: boolean
  disabled?: boolean
}

export function HabitCheckbox({ checked, disabled }: HabitCheckboxProps) {
  return (
    <div
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: checked ? 'none' : '2px solid var(--color-text-secondary)',
        backgroundColor: checked ? 'var(--color-accent)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        opacity: disabled ? 0.35 : 1,
        transition: `background-color var(--duration-fast) ease-out, border-color var(--duration-fast) ease-out`,
      }}
    >
      {checked && <Check size={12} color="white" strokeWidth={2.5} />}
    </div>
  )
}
