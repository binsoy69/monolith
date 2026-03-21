import { useState } from 'react'
import { HabitCheckbox } from './HabitCheckbox'
import type { HabitWithToday } from './habits-store'

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

interface HabitCardProps {
  habit: HabitWithToday
  onToggle: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  isScheduledToday: boolean
}

export function HabitCard({ habit, onToggle, onContextMenu, isScheduledToday }: HabitCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [flashAnimation, setFlashAnimation] = useState(false)

  const handleClick = () => {
    if (!isScheduledToday) return
    // Trigger flash animation
    setFlashAnimation(true)
    setTimeout(() => setFlashAnimation(false), 150)
    onToggle()
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (onContextMenu) {
      onContextMenu(e)
    }
  }

  const hasStreaks = habit.currentStreak > 0 || habit.bestStreak > 0

  // Opacity states per UI-SPEC:
  // Unscheduled: opacity: 0.35, Checked: opacity: 0.5, Active: 1
  let cardOpacity = 1
  if (!isScheduledToday) cardOpacity = 0.35
  else if (habit.completedToday) cardOpacity = 0.5

  const cardBg = flashAnimation
    ? 'var(--color-accent-subtle)'
    : isHovered && isScheduledToday && !habit.completedToday
    ? 'var(--color-bg-subtle)'
    : 'var(--color-bg-elevated)'

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={!isScheduledToday ? 'Not scheduled for today' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: '12px var(--space-4)',
        backgroundColor: cardBg,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        cursor: isScheduledToday ? 'pointer' : 'default',
        opacity: cardOpacity,
        transition: `background-color var(--duration-normal) ease-out, opacity var(--duration-normal) ease-out`,
        userSelect: 'none',
      }}
    >
      {/* Checkbox — hidden when unscheduled */}
      {isScheduledToday && (
        <HabitCheckbox checked={habit.completedToday} />
      )}
      {!isScheduledToday && (
        <div style={{ width: '20px', height: '20px', flexShrink: 0 }} />
      )}

      {/* Habit name + schedule days */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-size-body)',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {habit.name}
        </span>
        <span
          style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {formatDaysOfWeek(habit.daysOfWeek)}
        </span>
      </div>

      {/* Streak display — hidden when both are 0 */}
      {hasStreaks && (
        <span
          style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-text-secondary)',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Current: {habit.currentStreak} {habit.currentStreak === 1 ? 'day' : 'days'} | Best: {habit.bestStreak} {habit.bestStreak === 1 ? 'day' : 'days'}
        </span>
      )}
    </div>
  )
}
