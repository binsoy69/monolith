import { useState } from 'react'
import { GripVertical, FileText } from 'lucide-react'
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
  isExpanded?: boolean
  onClickRow?: () => void
}

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

function getPriorityMeta(
  priority: Task['priority']
): { label: 'P1' | 'P2' | 'P3'; color: string; background: string } | null {
  if (priority === 1) {
    return { label: 'P1', color: '#ef4444', background: 'rgba(239, 68, 68, 0.12)' }
  }
  if (priority === 2) {
    return { label: 'P2', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)' }
  }
  if (priority === 3) {
    return { label: 'P3', color: '#9494a8', background: 'rgba(148, 148, 168, 0.08)' }
  }
  return null
}

function renderExpandedNotes(task: Task) {
  const hasNotes = task.notes && task.notes.trim()

  return (
    <div
      style={{
        paddingTop: '0',
        paddingBottom: 'var(--space-2)',
        paddingLeft: '52px',
        paddingRight: 'var(--space-2)',
        opacity: task.completed ? 0.45 : 1,
        transition: `opacity var(--duration-fast) ease-out`,
      }}
    >
      {hasNotes ? (
        <div
          style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--line-height-normal)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {task.notes}
        </div>
      ) : (
        <div
          style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
          }}
        >
          No notes
        </div>
      )}
    </div>
  )
}

function RowBody({
  task,
  isHovered,
  isExpanded,
  isDragging = false,
  onToggleComplete,
  onContextMenu,
  onClickRow,
  dragHandleProps,
}: {
  task: Task
  isHovered: boolean
  isExpanded?: boolean
  isDragging?: boolean
  onToggleComplete: (id: string) => void
  onContextMenu?: (e: React.MouseEvent) => void
  onClickRow?: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}) {
  const hasNotes = task.notes && task.notes.trim()
  const priorityMeta = getPriorityMeta(task.priority)
  const isOverdue = !task.completed && task.carriedFromDate !== null && task.carriedFromDate < task.date
  const contentOpacity = task.completed ? 0.45 : 1

  return (
    <div
      style={{
        borderLeft:
          task.carriedFromDate !== null
            ? '3px solid var(--color-warning)'
            : '3px solid transparent',
      }}
    >
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
        onContextMenu={onContextMenu}
      >
        <div
          {...dragHandleProps}
          style={{
            width: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: dragHandleProps ? (isHovered ? 'var(--color-text-muted)' : 'transparent') : 'transparent',
            flexShrink: 0,
            cursor: dragHandleProps ? (isDragging ? 'grabbing' : 'grab') : 'default',
            transition: `color var(--duration-fast) ease-out`,
          }}
        >
          <GripVertical size={14} strokeWidth={1.5} />
        </div>

        <div
          style={{
            cursor: 'pointer',
            flexShrink: 0,
            opacity: contentOpacity,
            transition: `opacity var(--duration-fast) ease-out`,
          }}
          onClick={() => onToggleComplete(task.id)}
        >
          <TaskCheckbox checked={task.completed} />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flex: 1,
            overflow: 'hidden',
            cursor: 'pointer',
            opacity: contentOpacity,
            transition: `opacity var(--duration-fast) ease-out`,
            minWidth: 0,
          }}
          onClick={onClickRow}
        >
          {priorityMeta && (
            <span
              aria-label={`Priority ${priorityMeta.label}`}
              style={{
                width: '24px',
                height: '18px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-small)',
                fontWeight: 600,
                color: priorityMeta.color,
                backgroundColor: priorityMeta.background,
                flexShrink: 0,
              }}
            >
              {priorityMeta.label}
            </span>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '4px',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <span
              style={{
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text-primary)',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textDecoration: task.completed ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </span>
            {isOverdue && (
              <span
                style={{
                  color: 'var(--color-warning)',
                  fontSize: 'var(--font-size-small)',
                  flexShrink: 0,
                }}
              >
                overdue
              </span>
            )}
            {task.carriedFromDate !== null && (
              <span style={srOnlyStyle}>Carried from {task.carriedFromDate}</span>
            )}
          </div>

          {hasNotes && !isExpanded && (
            <FileText
              size={12}
              strokeWidth={1.5}
              style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
            />
          )}
        </div>
      </div>

      {isExpanded && renderExpandedNotes(task)}
    </div>
  )
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
  isExpanded,
  onClickRow,
}: TaskRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging
      ? {
          transform: CSS.Transform.toString(transform) + ' scale(1.02)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          opacity: 0.5,
        }
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RowBody
        task={task}
        isHovered={isHovered}
        isExpanded={isExpanded}
        isDragging={isDragging}
        onToggleComplete={onToggleComplete}
        onContextMenu={onContextMenu}
        onClickRow={onClickRow}
        dragHandleProps={listeners}
      />

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
  isExpanded,
  onClickRow,
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
    <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <RowBody
        task={task}
        isHovered={isHovered}
        isExpanded={isExpanded}
        onToggleComplete={onToggleComplete}
        onContextMenu={onContextMenu}
        onClickRow={onClickRow}
      />

      {isEditing && onSaveEdit && onCancelEdit && (
        <TaskEditForm task={task} onSave={onSaveEdit} onCancel={onCancelEdit} />
      )}
    </div>
  )
}

export function TaskRow({ isDraggable = true, isExpanded, onClickRow, ...props }: TaskRowProps) {
  if (isDraggable) {
    return <SortableTaskRow {...props} isDraggable={true} isExpanded={isExpanded} onClickRow={onClickRow} />
  }
  return <PlainTaskRow {...props} isDraggable={false} isExpanded={isExpanded} onClickRow={onClickRow} />
}
