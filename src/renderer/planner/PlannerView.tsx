import { useEffect } from 'react'
import { ModuleHeader } from '../shell/ModuleHeader'
import { usePlannerStore } from './planner-store'
import { DateNav } from './DateNav'
import { QuickAddInput } from './QuickAddInput'
import { TaskList } from './TaskList'

export function PlannerView() {
  const {
    tasks,
    isLoaded,
    viewDate,
    activeTab,
    loadTasks,
    createTask,
    toggleComplete,
    navigateDay,
    setActiveTab,
  } = usePlannerStore()

  useEffect(() => {
    loadTasks(viewDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewDate])

  const tasksDone = tasks.filter((t) => t.completed).length
  const tasksTotal = tasks.length

  const tabStyle = (tab: 'tasks' | 'notes') => ({
    fontSize: 'var(--font-size-body)',
    color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
    borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
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

      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-4)' }}>
        {activeTab === 'tasks' ? (
          <>
            <QuickAddInput date={viewDate} onAdd={createTask} />
            {isLoaded && (
              <TaskList
                tasks={tasks}
                onToggleComplete={toggleComplete}
                viewDate={viewDate}
              />
            )}
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text-muted)',
            }}
          >
            Notes — coming in plan 04
          </div>
        )}
      </div>
    </div>
  )
}
