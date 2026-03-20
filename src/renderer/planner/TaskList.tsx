import { TaskRow } from './TaskRow'
import type { Task } from '../../shared/domain-types'

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (id: string) => void
  viewDate: string
}

export function TaskList({ tasks, onToggleComplete, viewDate }: TaskListProps) {
  const incomplete = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt))

  const completed = tasks
    .filter((t) => t.completed)
    .sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt))

  if (tasks.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 'var(--space-8)',
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-text-muted)',
        }}
      >
        No tasks for {viewDate}
      </div>
    )
  }

  return (
    <div>
      {incomplete.map((task) => (
        <TaskRow key={task.id} task={task} onToggleComplete={onToggleComplete} />
      ))}
      {completed.map((task) => (
        <TaskRow key={task.id} task={task} onToggleComplete={onToggleComplete} />
      ))}
    </div>
  )
}
