import { useEffect, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useHabitsStore } from './habits-store'
import type { HabitWithToday } from './habits-store'
import { HabitCard } from './HabitCard'
import { HabitCountEditor } from './HabitCountEditor'
import { HabitHeatmap } from './HabitHeatmap'
import { HabitProgressBar } from './HabitProgressBar'
import { HabitForm } from './HabitForm'
import { ModuleHeader } from '../shell/ModuleHeader'
import type { ContextMenuItem } from '../shared/ContextMenu'
import { useContextMenu } from '../shared/useContextMenu'
import { ContextMenu } from '../shared/ContextMenu'
import { ArchiveConfirmation } from './ArchiveConfirmation'
import { ArchivedHabitsView } from './ArchivedHabitsView'
import { TagCreateDialog } from '../tags/TagCreateDialog'
import { useTagsStore } from '../tags/tags-store'

function getTodayDateStr(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function countCompletedDays(points: Array<{ completed: boolean }>, days: number): number {
  return points.slice(-days).filter((point) => point.completed).length
}

interface HabitsViewProps {
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
  const historyByHabitId = useHabitsStore((state) => state.historyByHabitId)
  const loadingHistoryIds = useHabitsStore((state) => state.loadingHistoryIds)
  const loadHistory = useHabitsStore((state) => state.loadHistory)
  const reorderHabits = useHabitsStore((state) => state.reorderHabits)
  const incrementCount = useHabitsStore((state) => state.incrementCount)
  const setCount = useHabitsStore((state) => state.setCount)
  const resetCount = useHabitsStore((state) => state.resetCount)
  const showArchived = useHabitsStore((state) => state.showArchived)
  const setShowArchived = useHabitsStore((state) => state.setShowArchived)

  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<HabitWithToday | null>(null)
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null)
  const [archivingHabit, setArchivingHabit] = useState<HabitWithToday | null>(null)
  const [tagDialogTargetId, setTagDialogTargetId] = useState<string | null>(null)

  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu()
  const ensureItemTags = useTagsStore((state) => state.ensureItemTags)
  const setTagAssignment = useTagsStore((state) => state.setTagAssignment)
  const createTag = useTagsStore((state) => state.createTag)

  const todayStr = getTodayDateStr()
  const todayDayIndex = new Date(`${todayStr}T12:00:00`).getDay()
  const historyWindowDays = 90
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  useEffect(() => {
    void load(todayStr)
  }, [load, todayStr])

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

  const handleFormSubmit = async (data: {
    name: string
    daysOfWeek: string
    kind: HabitWithToday['kind']
    targetCount: number | null
  }) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, data)
    } else {
      await createHabit(data)
    }
    closeForm()
  }

  const handleContextMenu = async (event: React.MouseEvent, habit: HabitWithToday) => {
    const assignedTags = await ensureItemTags('habit', habit.id)
    const assignedTagIds = new Set(assignedTags.map((tag) => tag.id))
    const tags = useTagsStore.getState().tags
    const tagChildren: ContextMenuItem[] = [
      ...tags.map((tag) => ({
        label: tag.name,
        checked: assignedTagIds.has(tag.id),
        closeOnClick: false,
        onClick: () => {
          void (async () => {
            const latestAssigned = await useTagsStore.getState().ensureItemTags('habit', habit.id)
            const isAssigned = latestAssigned.some((entry) => entry.id === tag.id)
            await useTagsStore.getState().setTagAssignment('habit', habit.id, tag.id, !isAssigned)
          })()
        },
      })),
      {
        label: 'New tag...',
        onClick: () => setTagDialogTargetId(habit.id),
      },
    ]

    const items: ContextMenuItem[] = [
      {
        label: 'Edit',
        onClick: () => openEditForm(habit),
      },
    ]

    if (habit.kind === 'count' && habit.todayValue > 0) {
      items.push({
        label: "Reset today's count",
        onClick: () => resetCount(habit.id, todayStr),
      })
    }

    items.push({
      label: 'Tags',
      onClick: () => {},
      children: tagChildren,
    })

    items.push({
      label: 'Archive',
      onClick: () => setArchivingHabit(habit),
      destructive: true,
    })

    showContextMenu(event, items)
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

  const handleToggleExpand = (habit: HabitWithToday) => {
    const nextExpandedId = expandedHabitId === habit.id ? null : habit.id
    setExpandedHabitId(nextExpandedId)

    if (nextExpandedId === habit.id && !historyByHabitId[habit.id]) {
      void loadHistory(habit.id, todayStr, historyWindowDays)
    }
  }

  const habitsWithScheduled = habits.map((habit, index) => ({
    ...habit,
    isScheduledToday: habit.daysOfWeek[todayDayIndex] === '1',
    orderIndex: index,
  }))

  const scheduledIncomplete = habitsWithScheduled
    .filter((habit) => habit.isScheduledToday && !habit.completedToday)
    .sort((a, b) => a.orderIndex - b.orderIndex)
  const unscheduled = habitsWithScheduled
    .filter((habit) => !habit.isScheduledToday)
    .sort((a, b) => a.orderIndex - b.orderIndex)
  const completedHabits = habitsWithScheduled
    .filter((habit) => habit.isScheduledToday && habit.completedToday)
    .sort((a, b) => a.orderIndex - b.orderIndex)

  const scheduledHabits = habitsWithScheduled.filter((habit) => habit.isScheduledToday)
  const completedCount = scheduledHabits.filter((habit) => habit.completedToday).length
  const totalScheduled = scheduledHabits.length

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = scheduledIncomplete.findIndex((habit) => habit.id === active.id)
    const newIndex = scheduledIncomplete.findIndex((habit) => habit.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const reordered = arrayMove(scheduledIncomplete, oldIndex, newIndex)
    void reorderHabits(reordered.map((habit) => habit.id))
  }

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

  const renderHabitCard = (
    habit: (typeof habitsWithScheduled)[number],
    isDraggable: boolean
  ) => {
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

    const historyPoints = historyByHabitId[habit.id] ?? []
    const historyLoading = loadingHistoryIds.includes(habit.id)
    const details = historyLoading ? (
      <div
        style={{
          paddingTop: 'var(--space-4)',
          fontSize: 'var(--font-size-small)',
          color: 'var(--color-text-muted)',
        }}
      >
        Loading history...
      </div>
    ) : (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          paddingTop: 'var(--space-4)',
        }}
      >
        {habit.kind === 'count' && (
          <HabitCountEditor
            habitName={habit.name}
            value={habit.todayValue}
            targetCount={habit.targetCount ?? 1}
            onApply={(value) => setCount(habit.id, todayStr, value)}
          />
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 'var(--space-2)',
          }}
        >
          <div
            style={{
              padding: 'var(--space-2)',
              backgroundColor: 'var(--color-bg-base)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Last 7 days
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-heading)',
                color: 'var(--color-text-primary)',
                fontWeight: 600,
              }}
            >
              {countCompletedDays(historyPoints, 7)}
            </div>
          </div>

          <div
            style={{
              padding: 'var(--space-2)',
              backgroundColor: 'var(--color-bg-base)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Last 30 days
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-heading)',
                color: 'var(--color-text-primary)',
                fontWeight: 600,
              }}
            >
              {countCompletedDays(historyPoints, 30)}
            </div>
          </div>
        </div>

        <HabitHeatmap points={historyPoints} />
      </div>
    )

    return (
      <HabitCard
        key={habit.id}
        habit={habit}
        onToggle={() => toggleComplete(habit.id, todayStr)}
        onIncrementCount={() => incrementCount(habit.id, todayStr)}
        onToggleExpand={() => handleToggleExpand(habit)}
        onContextMenu={(event) => handleContextMenu(event, habit)}
        isScheduledToday={habit.isScheduledToday}
        isExpanded={expandedHabitId === habit.id}
        isDraggable={isDraggable}
        details={details}
      />
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
        {showForm && (
          <HabitForm
            mode={editingHabit ? 'edit' : 'create'}
            initialName={editingHabit?.name ?? ''}
            initialDaysOfWeek={editingHabit?.daysOfWeek ?? '1111111'}
            initialKind={editingHabit?.kind ?? 'boolean'}
            initialTargetCount={editingHabit?.targetCount ?? null}
            onSubmit={handleFormSubmit}
            onCancel={closeForm}
          />
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            opacity: showForm ? 0.6 : 1,
            transition: `opacity var(--duration-normal) ease-out`,
            pointerEvents: showForm ? 'none' : 'auto',
          }}
        >
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={scheduledIncomplete.map((habit) => habit.id)}
              strategy={verticalListSortingStrategy}
            >
              {scheduledIncomplete.map((habit) => renderHabitCard(habit, true))}
            </SortableContext>
          </DndContext>

          {unscheduled.map((habit) => renderHabitCard(habit, false))}
          {completedHabits.map((habit) => renderHabitCard(habit, false))}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          items={contextMenu.items}
          position={contextMenu.position}
          onClose={hideContextMenu}
        />
      )}

      <TagCreateDialog
        isOpen={tagDialogTargetId !== null}
        onClose={() => setTagDialogTargetId(null)}
        onCreate={async (name) => {
          const tag = await createTag(name)
          if (tag && tagDialogTargetId) {
            await setTagAssignment('habit', tagDialogTargetId, tag.id, true)
          }
          setTagDialogTargetId(null)
        }}
      />
    </div>
  )
}
