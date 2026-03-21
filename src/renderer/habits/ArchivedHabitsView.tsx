import { useEffect, useState } from 'react'
import type { Habit } from '../../shared/domain-types'

/**
 * ArchivedHabitsView — Lists archived habits by name and schedule.
 * No checkboxes, no streaks — archived habits are display-only.
 * Shown when the "Show Archived" toggle is active.
 */

/** Convert a 7-char bitmask to a human-readable day list (e.g., "Mon, Wed, Fri") */
function formatDaysOfWeek(mask: string): string {
  // Bitmask: index 0=Sun, 1=Mon, ..., 6=Sat
  // Display order: Mon-Sun
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const displayOrder = [1, 2, 3, 4, 5, 6, 0] // Mon first visually

  const days = displayOrder
    .filter((i) => mask[i] === '1')
    .map((i) => labels[i])

  if (days.length === 7) return 'Every day'
  if (days.length === 0) return 'No days'
  return days.join(', ')
}

export function ArchivedHabitsView() {
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    window.api.habits.listArchived().then((habits) => {
      setArchivedHabits(habits)
      setIsLoaded(true)
    })
  }, [])

  if (!isLoaded) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          padding: 'var(--space-8)',
        }}
      >
        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body)' }}>
          Loading...
        </span>
      </div>
    )
  }

  if (archivedHabits.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          padding: 'var(--space-8)',
        }}
      >
        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body)' }}>
          No archived habits
        </span>
      </div>
    )
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      {archivedHabits.map((habit) => (
        <div
          key={habit.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
            padding: '12px var(--space-4)',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {habit.name}
          </span>
          <span
            style={{
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {formatDaysOfWeek(habit.daysOfWeek)}
          </span>
        </div>
      ))}
    </div>
  )
}
