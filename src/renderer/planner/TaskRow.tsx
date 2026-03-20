import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import { TaskCheckbox } from './TaskCheckbox'
import type { Task } from '../../shared/domain-types'

interface TaskRowProps {
  task: Task
  onToggleComplete: (id: string) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export function TaskRow({ task, onToggleComplete, onContextMenu }: TaskRowProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      style={{
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        paddingLeft: 'var(--space-2)',
        paddingRight: 'var(--space-2)',
        backgroundColor: isHovered ? 'var(--color-bg-subtle)' : 'transparent',
        cursor: 'default',
        transition: `background-color var(--duration-fast) ease-out`,
        userSelect: 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={onContextMenu}
    >
      <div
        style={{
          width: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isHovered ? 'var(--color-text-muted)' : 'transparent',
          flexShrink: 0,
          cursor: 'grab',
          transition: `color var(--duration-fast) ease-out`,
        }}
      >
        <GripVertical size={14} strokeWidth={1.5} />
      </div>

      <div
        style={{ cursor: 'pointer', flexShrink: 0 }}
        onClick={() => onToggleComplete(task.id)}
      >
        <TaskCheckbox checked={task.completed} />
      </div>

      <span
        style={{
          fontSize: 'var(--font-size-body)',
          color: 'var(--color-text-primary)',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textDecoration: task.completed ? 'line-through' : 'none',
          opacity: task.completed ? 0.45 : 1,
          transition: `opacity var(--duration-fast) ease-out`,
        }}
      >
        {task.title}
      </span>
    </div>
  )
}
