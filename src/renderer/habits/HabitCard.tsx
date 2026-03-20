import { useState } from 'react'
import { HabitCheckbox } from './HabitCheckbox'
import type { HabitWithToday } from './habits-store'

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

  const hasStreaks = habit.currentStreak > 0 || habit.bestStreak > 0

  const cardBg = flashAnimation
    ? 'var(--color-accent-subtle)'
    : isHovered && isScheduledToday && !habit.completedToday
    ? 'var(--color-bg-subtle)'
    : 'var(--color-bg-elevated)'

  return (
    <div
      onClick={handleClick}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: '12px var(--space-4)',
        backgroundColor: cardBg,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        cursor: isScheduledToday ? 'pointer' : 'default',
        opacity: !isScheduledToday ? 0.35 : habit.completedToday ? 0.5 : 1,
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

      {/* Habit name */}
      <span
        style={{
          flex: 1,
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
