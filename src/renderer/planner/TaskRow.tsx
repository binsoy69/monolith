import { useEffect, useRef, useState } from 'react'
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
  editFocusField?: 'title' | 'notes'
  onConfirmDelete?: (id: string) => void
  onCancelDelete?: () => void
  isDraggable?: boolean
  isExpanded?: boolean
  onClickRow?: () => void
  onOpenNotesEditor?: (taskId: string) => void
  isHighlighted?: boolean
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

const noteActionButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '24px',
  padding: '0 var(--space-2)',
  borderRadius: '999px',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-bg-base)',
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--font-size-small)',
  fontFamily: 'inherit',
  cursor: 'pointer',
}

function renderExpandedNotes(
  task: Task,
  onOpenNotesEditor?: (taskId: string) => void
) {
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
      {onOpenNotesEditor && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenNotesEditor(task.id)
            }}
            style={noteActionButtonStyle}
          >
            {hasNotes ? 'Edit note' : 'Add note'}
          </button>
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
  isFlashActive = false,
  onToggleComplete,
  onContextMenu,
  onClickRow,
  onOpenNotesEditor,
  dragHandleProps,
}: {
  task: Task
  isHovered: boolean
  isExpanded?: boolean
  isDragging?: boolean
  isFlashActive?: boolean
  onToggleComplete: (id: string) => void
  onContextMenu?: (e: React.MouseEvent) => void
  onClickRow?: () => void
  onOpenNotesEditor?: (taskId: string) => void
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
          backgroundColor: isFlashActive
            ? 'var(--color-accent-subtle)'
            : isHovered
              ? 'var(--color-bg-subtle)'
              : 'transparent',
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

          {hasNotes && !isExpanded && onOpenNotesEditor && (
            <button
              type="button"
              aria-label={`Edit note for ${task.title}`}
              onClick={(e) => {
                e.stopPropagation()
                onOpenNotesEditor(task.id)
              }}
              style={{
                border: 'none',
                background: 'transparent',
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <FileText size={12} strokeWidth={1.5} />
            </button>
          )}
          {!hasNotes && !isExpanded && isHovered && onOpenNotesEditor && (
            <button
              type="button"
              aria-label={`Add note to ${task.title}`}
              onClick={(e) => {
                e.stopPropagation()
                onOpenNotesEditor(task.id)
              }}
              style={noteActionButtonStyle}
            >
              Add note
            </button>
          )}
        </div>
      </div>

      {isExpanded && renderExpandedNotes(task, onOpenNotesEditor)}
    </div>
  )
}

function useRowHighlight(isHighlighted = false): {
  rowRef: React.MutableRefObject<HTMLDivElement | null>
  isFlashActive: boolean
} {
  const rowRef = useRef<HTMLDivElement | null>(null)
  const [isFlashActive, setIsFlashActive] = useState(false)

  useEffect(() => {
    if (!isHighlighted) {
      return
    }

    rowRef.current?.scrollIntoView?.({ block: 'center' })
    setIsFlashActive(true)
    const timer = window.setTimeout(() => setIsFlashActive(false), 1500)
    return () => window.clearTimeout(timer)
  }, [isHighlighted])

  return { rowRef, isFlashActive }
}

function SortableTaskRow({
  task,
  onToggleComplete,
  onContextMenu,
  isEditing,
  isDeleting,
  onSaveEdit,
  onCancelEdit,
  editFocusField,
  onConfirmDelete,
  onCancelDelete,
  isExpanded,
  onClickRow,
  onOpenNotesEditor,
  isHighlighted = false,
}: TaskRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { rowRef, isFlashActive } = useRowHighlight(isHighlighted)
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
      ref={(element) => {
        rowRef.current = element
        setNodeRef(element)
      }}
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
        isFlashActive={isFlashActive}
        onToggleComplete={onToggleComplete}
        onContextMenu={onContextMenu}
        onClickRow={onClickRow}
        onOpenNotesEditor={onOpenNotesEditor}
        dragHandleProps={listeners}
      />

      {isEditing && onSaveEdit && onCancelEdit && (
        <TaskEditForm
          task={task}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          initialFocusField={editFocusField}
        />
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
  editFocusField,
  onConfirmDelete,
  onCancelDelete,
  isExpanded,
  onClickRow,
  onOpenNotesEditor,
  isHighlighted = false,
}: TaskRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { rowRef, isFlashActive } = useRowHighlight(isHighlighted)

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
      ref={rowRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RowBody
        task={task}
        isHovered={isHovered}
        isExpanded={isExpanded}
        isFlashActive={isFlashActive}
        onToggleComplete={onToggleComplete}
        onContextMenu={onContextMenu}
        onClickRow={onClickRow}
        onOpenNotesEditor={onOpenNotesEditor}
      />

      {isEditing && onSaveEdit && onCancelEdit && (
        <TaskEditForm
          task={task}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          initialFocusField={editFocusField}
        />
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
