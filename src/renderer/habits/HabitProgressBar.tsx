interface HabitProgressBarProps {
  completed: number
  total: number
}

export function HabitProgressBar({ completed, total }: HabitProgressBarProps) {
  return (
    <div
      style={{
        paddingLeft: 'var(--space-4)',
        paddingRight: 'var(--space-4)',
        paddingTop: 'var(--space-2)',
        paddingBottom: 'var(--space-2)',
        borderBottom: '1px solid var(--color-border)',
        fontSize: 'var(--font-size-small)',
        color: 'var(--color-text-secondary)',
      }}
    >
      <span style={{ color: 'var(--color-accent)' }}>{completed}</span>
      /{total} completed
    </div>
  )
}
