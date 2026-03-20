import { Check } from 'lucide-react'

interface TaskCheckboxProps {
  checked: boolean
  disabled?: boolean
}

export function TaskCheckbox({ checked, disabled }: TaskCheckboxProps) {
  return (
    <div
      style={{
        width: '20px',
        height: '20px',
        borderRadius: 'var(--radius-sm)',
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
