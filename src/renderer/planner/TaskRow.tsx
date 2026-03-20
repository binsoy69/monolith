import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCheckbox } from './TaskCheckbox'
import { TaskEditForm } from './TaskEditForm'
import { DeleteConfirmation } from './DeleteConfirmation'
import type { Task } from '../../shared/domain-types'

interface TaskRowProps {
  task: Task
  onToggleComplete: (id: string) => void
  onContextMenu?: (e: React.MouseEvent) => void
  isEditing?: boolean
  isDeleting?: boolean
  onSaveEdit?: (id: string, data: { title: string; notes: string }) => void
  onCancelEdit?: () => void
  onConfirmDelete?: (id: string) => void
  onCancelDelete?: () => void
  isDraggable?: boolean
}

function SortableTaskRow({
  task,
  onToggleComplete,
  onContextMenu,
  isEditing,
  isDeleting,
  onSaveEdit,
  onCancelEdit,
  onConfirmDelete,
  onCancelDelete,
}: TaskRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : task.completed ? 0.45 : 1,
    ...(isDragging
      ? { transform: CSS.Transform.toString(transform) + ' scale(1.02)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }
      : {}),
  }

  if (isDeleting) {
    return (
      <DeleteConfirmation
        onConfirm={() => onConfirmDelete?.(task.id)}
        onCancel={() => onCancelDelete?.()}
      />
    )
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
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
          {...listeners}
          style={{
            width: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isHovered ? 'var(--color-text-muted)' : 'transparent',
            flexShrink: 0,
            cursor: isDragging ? 'grabbing' : 'grab',
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

      {isEditing && onSaveEdit && onCancelEdit && (
        <TaskEditForm task={task} onSave={onSaveEdit} onCancel={onCancelEdit} />
      )}
    </div>
  )
}

function PlainTaskRow({
  task,
  onToggleComplete,
  onContextMenu,
  isEditing,
  isDeleting,
  onSaveEdit,
  onCancelEdit,
  onConfirmDelete,
  onCancelDelete,
}: TaskRowProps) {
  const [isHovered, setIsHovered] = useState(false)

  if (isDeleting) {
    return (
      <DeleteConfirmation
        onConfirm={() => onConfirmDelete?.(task.id)}
        onCancel={() => onCancelDelete?.()}
      />
    )
  }

  return (
    <div>
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
        {/* Non-draggable — no drag handle interaction, just display */}
        <div
          style={{
            width: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'transparent',
            flexShrink: 0,
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

      {isEditing && onSaveEdit && onCancelEdit && (
        <TaskEditForm task={task} onSave={onSaveEdit} onCancel={onCancelEdit} />
      )}
    </div>
  )
}

export function TaskRow({ isDraggable = true, ...props }: TaskRowProps) {
  if (isDraggable) {
    return <SortableTaskRow {...props} isDraggable={true} />
  }
  return <PlainTaskRow {...props} isDraggable={false} />
}
