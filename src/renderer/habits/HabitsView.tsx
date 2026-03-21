import { useEffect, useState } from 'react'
import { useHabitsStore } from './habits-store'
import type { HabitWithToday } from './habits-store'
import { HabitCard } from './HabitCard'
import { HabitProgressBar } from './HabitProgressBar'
import { HabitForm } from './HabitForm'
import { ModuleHeader } from '../shell/ModuleHeader'
import { useContextMenu } from '../shared/useContextMenu'
import { ContextMenu } from '../shared/ContextMenu'
import { ArchiveConfirmation } from './ArchiveConfirmation'
import { ArchivedHabitsView } from './ArchivedHabitsView'

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

interface HabitsViewProps {
  /** Increments when "N" keyboard shortcut fires to open create form */
  newItemTrigger?: number
}

export function HabitsView({ newItemTrigger }: HabitsViewProps) {
  const habits = useHabitsStore((state) => state.habits)
  const isLoaded = useHabitsStore((state) => state.isLoaded)
  const load = useHabitsStore((state) => state.load)
  const toggleComplete = useHabitsStore((state) => state.toggleComplete)
  const createHabit = useHabitsStore((state) => state.createHabit)
  const updateHabit = useHabitsStore((state) => state.updateHabit)
  const archiveHabit = useHabitsStore((state) => state.archiveHabit)
  const showArchived = useHabitsStore((state) => state.showArchived)
  const setShowArchived = useHabitsStore((state) => state.setShowArchived)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<HabitWithToday | null>(null)
  // Archive confirmation state
  const [archivingHabit, setArchivingHabit] = useState<HabitWithToday | null>(null)

  // Context menu hook
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu()

  const todayStr = getTodayDateStr()
  const todayDayIndex = new Date().getDay() // 0=Sun, 1=Mon, ...6=Sat

  useEffect(() => {
    load(todayStr)
  }, [load, todayStr])

  // Open create form when N key fires from App-level trigger
  useEffect(() => {
    if (newItemTrigger && newItemTrigger > 0) {
      openCreateForm()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newItemTrigger])

  const openCreateForm = () => {
    setEditingHabit(null)
    setShowForm(true)
  }

  const openEditForm = (habit: HabitWithToday) => {
    setEditingHabit(habit)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingHabit(null)
  }

  const handleFormSubmit = async (data: { name: string; daysOfWeek: string }) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, data)
    } else {
      await createHabit(data)
    }
    closeForm()
  }

  const handleContextMenu = (e: React.MouseEvent, habit: HabitWithToday) => {
    showContextMenu(e, [
      {
        label: 'Edit',
        onClick: () => openEditForm(habit),
      },
      {
        label: 'Archive',
        onClick: () => setArchivingHabit(habit),
        destructive: true,
      },
    ])
  }

  const handleArchiveConfirm = async () => {
    if (archivingHabit) {
      await archiveHabit(archivingHabit.id)
      setArchivingHabit(null)
    }
  }

  const handleArchiveCancel = () => {
    setArchivingHabit(null)
  }

  // Determine if each habit is scheduled today
  const habitsWithScheduled = habits.map((habit) => ({
    ...habit,
    isScheduledToday: habit.daysOfWeek[todayDayIndex] === '1',
  }))

  // Sort: unchecked+scheduled first, then unchecked+unscheduled (dimmed), then checked (dimmed, sunk to bottom)
  const sorted = [...habitsWithScheduled].sort((a, b) => {
    if (a.completedToday !== b.completedToday) {
      return a.completedToday ? 1 : -1
    }
    if (!a.completedToday && a.isScheduledToday !== b.isScheduledToday) {
      return a.isScheduledToday ? -1 : 1
    }
    return 0
  })

  const scheduledHabits = habitsWithScheduled.filter((h) => h.isScheduledToday)
  const completedCount = scheduledHabits.filter((h) => h.completedToday).length
  const totalScheduled = scheduledHabits.length

  // Header right slot: toggle archived + new habit button
  const headerRight = (
    <>
      <button
        onClick={() => setShowArchived(!showArchived)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-text-secondary)',
          cursor: 'pointer',
          padding: 'var(--space-1) var(--space-2)',
          fontFamily: 'inherit',
        }}
      >
        {showArchived ? 'Show Active' : 'Show Archived'}
      </button>
      <button
        onClick={openCreateForm}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-accent)',
          cursor: 'pointer',
          padding: 'var(--space-1) var(--space-2)',
          fontFamily: 'inherit',
        }}
      >
        + New Habit
      </button>
    </>
  )

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <ModuleHeader moduleId="habits" right={headerRight} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body)' }}>
            Loading...
          </span>
        </div>
      </div>
    )
  }

  // Archived habits view
  if (showArchived) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <ModuleHeader moduleId="habits" right={headerRight} />
        <ArchivedHabitsView />
        {contextMenu && (
          <ContextMenu
            items={contextMenu.items}
            position={contextMenu.position}
            onClose={hideContextMenu}
          />
        )}
      </div>
    )
  }

  if (habits.length === 0 && !showForm) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <ModuleHeader moduleId="habits" right={headerRight} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
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
            onClick={openCreateForm}
            style={{
              marginTop: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--color-accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-body)',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Create your first habit
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ModuleHeader moduleId="habits" right={headerRight} />
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
        {/* Inline form at top — shown for create and edit */}
        {showForm && (
          <HabitForm
            mode={editingHabit ? 'edit' : 'create'}
            initialName={editingHabit?.name ?? ''}
            initialDaysOfWeek={editingHabit?.daysOfWeek ?? '1111111'}
            onSubmit={handleFormSubmit}
            onCancel={closeForm}
          />
        )}

        {/* Habit list — dims when form is open */}
        {/* When form is open, dim the card list to opacity 0.6 per UI-SPEC */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            opacity: showForm ? 0.6 : 1, // opacity: 0.6 when form is active
            transition: `opacity var(--duration-normal) ease-out`,
            pointerEvents: showForm ? 'none' : 'auto',
          }}
        >
          {sorted.map((habit) => {
            // Show archive confirmation in place of the card
            if (archivingHabit?.id === habit.id) {
              return (
                <ArchiveConfirmation
                  key={habit.id}
                  habitName={habit.name}
                  onConfirm={handleArchiveConfirm}
                  onCancel={handleArchiveCancel}
                />
              )
            }
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={() => toggleComplete(habit.id, todayStr)}
                onContextMenu={(e) => handleContextMenu(e, habit)}
                isScheduledToday={habit.isScheduledToday}
              />
            )
          })}
        </div>
      </div>

      {/* Context menu rendered via portal */}
      {contextMenu && (
        <ContextMenu
          items={contextMenu.items}
          position={contextMenu.position}
          onClose={hideContextMenu}
        />
      )}
    </div>
  )
}
