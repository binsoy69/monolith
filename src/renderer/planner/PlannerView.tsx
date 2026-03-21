import { useEffect, useState, useRef } from 'react'
import { ModuleHeader } from '../shell/ModuleHeader'
import { usePlannerStore } from './planner-store'
import { DateNav } from './DateNav'
import { QuickAddInput } from './QuickAddInput'
import { TaskList } from './TaskList'
import { DailyNotesView } from './DailyNotesView'
import { ContextMenu } from '../shared/ContextMenu'
import { useContextMenu } from '../shared/useContextMenu'

export function PlannerView() {
  const {
    tasks,
    isLoaded,
    viewDate,
    activeTab,
    loadTasks,
    createTask,
    toggleComplete,
    updateTask,
    deleteTask,
    reorderTasks,
    navigateDay,
    setActiveTab,
    loadNotes,
  } = usePlannerStore()

  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu()

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [movePickerTaskId, setMovePickerTaskId] = useState<string | null>(null)
  const [movePickerPos, setMovePickerPos] = useState({ x: 0, y: 0 })
  const moveDateInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadTasks(viewDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewDate])

  // Load notes when switching to notes tab or when date changes while on notes tab
  useEffect(() => {
    if (activeTab === 'notes') {
      loadNotes(viewDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewDate, activeTab])

  const tasksDone = tasks.filter((t) => t.completed).length
  const tasksTotal = tasks.length

  const tabStyle = (tab: 'tasks' | 'notes') => ({
    fontSize: 'var(--font-size-body)',
    color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
    paddingLeft: 'var(--space-2)',
    paddingRight: 'var(--space-2)',
    paddingTop: '0',
    paddingBottom: '0',
    height: '40px',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    transition: `color var(--duration-fast) ease-out, border-color var(--duration-fast) ease-out`,
  } as React.CSSProperties)

  function handleClickTask(taskId: string) {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId))
  }

  function handleTaskContextMenu(e: React.MouseEvent, taskId: string) {
    showContextMenu(e, [
      {
        label: 'Edit',
        onClick: () => {
          setDeletingTaskId(null)
          setExpandedTaskId(null)
          setEditingTaskId(taskId)
        },
      },
      {
        label: 'Move to date',
        onClick: () => {
          setMovePickerTaskId(taskId)
          setMovePickerPos({ x: e.clientX, y: e.clientY })
          // Focus the hidden date input after render
          setTimeout(() => moveDateInputRef.current?.showPicker?.(), 50)
        },
      },
      {
        label: 'Delete',
        onClick: () => {
          setEditingTaskId(null)
          setDeletingTaskId(taskId)
        },
        destructive: true,
      },
    ])
  }

  function handleSaveEdit(id: string, data: { title: string; notes: string }) {
    updateTask(id, { title: data.title, notes: data.notes })
    setEditingTaskId(null)
  }

  function handleConfirmDelete(id: string) {
    deleteTask(id)
    setDeletingTaskId(null)
  }

  async function handleMoveToDate(newDate: string) {
    if (!movePickerTaskId || !newDate) return
    await updateTask(movePickerTaskId, { date: newDate })
    setMovePickerTaskId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ModuleHeader
        moduleId="planner"
        left={
          <DateNav
            viewDate={viewDate}
            onPrev={() => navigateDay(-1)}
            onNext={() => navigateDay(1)}
            tasksDone={tasksDone}
            tasksTotal={tasksTotal}
          />
        }
        right={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button style={tabStyle('tasks')} onClick={() => setActiveTab('tasks')}>
              Tasks
            </button>
            <button style={tabStyle('notes')} onClick={() => setActiveTab('notes')}>
              Notes
            </button>
          </div>
        }
      />

      <div
        style={{
          flex: 1,
          overflow: activeTab === 'notes' ? 'hidden' : 'auto',
          padding: activeTab === 'notes' ? '0' : 'var(--space-4)',
          display: activeTab === 'notes' ? 'flex' : 'block',
          flexDirection: 'column',
        }}
      >
        {activeTab === 'tasks' ? (
          <>
            <QuickAddInput date={viewDate} onAdd={createTask} />
            {isLoaded && (
              <TaskList
                tasks={tasks}
                onToggleComplete={toggleComplete}
                onContextMenu={handleTaskContextMenu}
                onReorder={reorderTasks}
                editingTaskId={editingTaskId}
                deletingTaskId={deletingTaskId}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => setEditingTaskId(null)}
                onConfirmDelete={handleConfirmDelete}
                onCancelDelete={() => setDeletingTaskId(null)}
                viewDate={viewDate}
                expandedTaskId={expandedTaskId}
                onClickTask={handleClickTask}
              />
            )}
          </>
        ) : (
          <DailyNotesView date={viewDate} />
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          items={contextMenu.items}
          position={contextMenu.position}
          onClose={hideContextMenu}
        />
      )}

      {/* Move to date — hidden date input that shows a native picker */}
      {movePickerTaskId && (
        <input
          ref={moveDateInputRef}
          type="date"
          defaultValue={viewDate}
          onChange={(e) => handleMoveToDate(e.target.value)}
          style={{
            position: 'fixed',
            left: movePickerPos.x,
            top: movePickerPos.y,
            opacity: 0,
            pointerEvents: 'auto',
            zIndex: 3000,
          }}
          onBlur={() => setMovePickerTaskId(null)}
        />
      )}
    </div>
  )
}
