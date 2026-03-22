import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { HabitWithToday } from './habits-store'
import { HabitCheckbox } from './HabitCheckbox'

function formatDaysOfWeek(mask: string): string {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const displayOrder = [1, 2, 3, 4, 5, 6, 0]
  const days = displayOrder
    .filter((index) => mask[index] === '1')
    .map((index) => labels[index])

  if (days.length === 7) return 'Every day'
  if (days.length === 0) return 'No days'
  return days.join(', ')
}

interface HabitCardProps {
  habit: HabitWithToday
  onToggle: () => void
  onIncrementCount: () => void
  onToggleExpand: () => void
  onContextMenu?: (e: React.MouseEvent) => void
  isScheduledToday: boolean
  isExpanded: boolean
  isDraggable?: boolean
  details?: React.ReactNode
}

interface HabitCardLayoutProps extends HabitCardProps {
  handleAttributes?: ReturnType<typeof useSortable>['attributes']
  handleListeners?: ReturnType<typeof useSortable>['listeners']
  setNodeRef?: (element: HTMLDivElement | null) => void
  dragStyle?: React.CSSProperties
}

function HabitCardLayout({
  habit,
  onToggle,
  onIncrementCount,
  onToggleExpand,
  onContextMenu,
  isScheduledToday,
  isExpanded,
  isDraggable = false,
  details,
  handleAttributes,
  handleListeners,
  setNodeRef,
  dragStyle,
}: HabitCardLayoutProps) {
  const [isHovered, setIsHovered] = useState(false)
  const hasStreaks = habit.currentStreak > 0 || habit.bestStreak > 0
  const targetCount = habit.targetCount ?? 1

  let cardOpacity = 1
  if (!isScheduledToday) cardOpacity = 0.35
  else if (habit.completedToday) cardOpacity = 0.5

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    onContextMenu?.(event)
  }

  const handleBooleanToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!isScheduledToday) return
    onToggle()
  }

  const handleCountIncrement = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!isScheduledToday) return
    onIncrementCount()
  }

  const handleCountKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (event.key === ' ') {
      event.preventDefault()
      if (isScheduledToday) {
        onIncrementCount()
      }
    }
  }

  const handleExpandKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onToggleExpand()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        opacity: cardOpacity,
        overflow: 'hidden',
        transition: `background-color var(--duration-normal) ease-out, opacity var(--duration-normal) ease-out`,
        userSelect: 'none',
        ...dragStyle,
      }}
    >
      <div
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={!isScheduledToday ? 'Not scheduled for today' : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: '12px var(--space-4)',
          backgroundColor: isHovered ? 'var(--color-bg-subtle)' : 'var(--color-bg-elevated)',
          transition: `background-color var(--duration-fast) ease-out`,
        }}
      >
        <button
          type="button"
          {...handleAttributes}
          {...handleListeners}
          onClick={(event) => event.stopPropagation()}
          disabled={!isDraggable}
          aria-label="Reorder habit"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            background: 'none',
            border: 'none',
            padding: 0,
            color: isDraggable ? 'var(--color-text-muted)' : 'transparent',
            cursor: isDraggable ? 'grab' : 'default',
            flexShrink: 0,
          }}
        >
          <GripVertical size={14} strokeWidth={1.5} />
        </button>

        {habit.kind === 'count' ? (
          <button
            type="button"
            onClick={handleCountIncrement}
            onKeyDown={handleCountKeyDown}
            disabled={!isScheduledToday}
            aria-label={`Increment ${habit.name}`}
            style={{
              minWidth: '54px',
              height: '24px',
              borderRadius: '999px',
              border: '1px solid var(--color-border)',
              backgroundColor: habit.completedToday ? 'var(--color-accent-subtle)' : 'var(--color-bg-base)',
              color: habit.completedToday ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-body)',
              fontFamily: 'inherit',
              cursor: isScheduledToday ? 'pointer' : 'default',
              flexShrink: 0,
            }}
          >
            {habit.todayValue}/{targetCount}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleBooleanToggle}
            onKeyDown={(event) => event.stopPropagation()}
            disabled={!isScheduledToday}
            aria-label={`${habit.completedToday ? 'Mark incomplete' : 'Mark complete'} ${habit.name}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: isScheduledToday ? 'pointer' : 'default',
              flexShrink: 0,
            }}
          >
            <HabitCheckbox checked={habit.completedToday} />
          </button>
        )}

        <div
          role="button"
          tabIndex={0}
          onClick={onToggleExpand}
          onKeyDown={handleExpandKeyDown}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            overflow: 'hidden',
            cursor: 'pointer',
            outline: 'none',
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

      {isExpanded && details && (
        <div
          style={{
            padding: '0 var(--space-4) var(--space-4) 54px',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          {details}
        </div>
      )}
    </div>
  )
}

function SortableHabitCard(props: HabitCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.habit.id,
  })

  return (
    <HabitCardLayout
      {...props}
      setNodeRef={setNodeRef}
      handleAttributes={attributes}
      handleListeners={listeners}
      dragStyle={{
        transform: CSS.Transform.toString(transform),
        transition,
        ...(isDragging
          ? {
              opacity: 0.85,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
            }
          : {}),
      }}
    />
  )
}

function PlainHabitCard(props: HabitCardProps) {
  return <HabitCardLayout {...props} />
}

export function HabitCard({ isDraggable = false, ...props }: HabitCardProps) {
  if (isDraggable) {
    return <SortableHabitCard {...props} isDraggable={true} />
  }

  return <PlainHabitCard {...props} isDraggable={false} />
}
