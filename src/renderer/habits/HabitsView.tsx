import { useEffect } from 'react'
import { useHabitsStore } from './habits-store'
import { HabitCard } from './HabitCard'
import { HabitProgressBar } from './HabitProgressBar'

/**
 * Get today's date as YYYY-MM-DD string in local timezone.
 */
function getTodayDateStr(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function HabitsView() {
  const habits = useHabitsStore((state) => state.habits)
  const isLoaded = useHabitsStore((state) => state.isLoaded)
  const load = useHabitsStore((state) => state.load)
  const toggleComplete = useHabitsStore((state) => state.toggleComplete)

  const todayStr = getTodayDateStr()
  const todayDayIndex = new Date().getDay() // 0=Sun, 1=Mon, ...6=Sat

  useEffect(() => {
    load(todayStr)
  }, [load, todayStr])

  // Determine if each habit is scheduled today
  const habitsWithScheduled = habits.map((habit) => ({
    ...habit,
    isScheduledToday: habit.daysOfWeek[todayDayIndex] === '1',
  }))

  // Sort: unchecked+scheduled first, then unchecked+unscheduled (dimmed), then checked (dimmed, sunk to bottom)
  const sorted = [...habitsWithScheduled].sort((a, b) => {
    // Checked habits go last
    if (a.completedToday !== b.completedToday) {
      return a.completedToday ? 1 : -1
    }
    // Among unchecked: scheduled before unscheduled
    if (!a.completedToday && a.isScheduledToday !== b.isScheduledToday) {
      return a.isScheduledToday ? -1 : 1
    }
    return 0
  })

  const scheduledHabits = habitsWithScheduled.filter((h) => h.isScheduledToday)
  const completedCount = scheduledHabits.filter((h) => h.completedToday).length
  const totalScheduled = scheduledHabits.length

  if (!isLoaded) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body)' }}>
          Loading...
        </span>
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 'var(--space-2)',
          padding: 'var(--space-8)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}
        >
          No habits yet
        </span>
        <span
          style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}
        >
          Track your daily routines. Create your first habit to get started.
        </span>
        <button
          onClick={() => {
            // Create habit button — will be wired via ModuleHeader in plan 02-02
          }}
          style={{
            marginTop: 'var(--space-2)',
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-size-body)',
            cursor: 'pointer',
          }}
        >
          Create your first habit
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <HabitProgressBar completed={completedCount} total={totalScheduled} />
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-4)',
          paddingTop: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        {sorted.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onToggle={() => toggleComplete(habit.id, todayStr)}
            isScheduledToday={habit.isScheduledToday}
          />
        ))}
      </div>
    </div>
  )
}
