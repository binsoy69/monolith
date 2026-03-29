import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { TaskRow } from './TaskRow'
import type { Task } from '../../shared/domain-types'

function getCarryBucket(task: Task): 0 | 1 | 2 {
  if (task.completed) {
    return 2
  }
  return task.carriedFromDate !== null ? 0 : 1
}

function getPriorityRank(task: Task): number {
  if (task.priority === 1) return 0
  if (task.priority === 2) return 1
  if (task.priority === 3) return 2
  return 3
}

function isSameOrderingBand(left: Task, right: Task): boolean {
  return getCarryBucket(left) === getCarryBucket(right) && getPriorityRank(left) === getPriorityRank(right)
}

export function canReorderTasks(activeTask: Task, overTask: Task): boolean {
  return isSameOrderingBand(activeTask, overTask)
}

export function compareTasksForDisplay(a: Task, b: Task): number {
  const carryDiff = getCarryBucket(a) - getCarryBucket(b)
  if (carryDiff !== 0) return carryDiff

  const priorityDiff = getPriorityRank(a) - getPriorityRank(b)
  if (priorityDiff !== 0) return priorityDiff

  return a.position - b.position || a.createdAt.localeCompare(b.createdAt)
}

interface TaskListProps {
  tasks: Task[]
  onToggleComplete: (id: string) => void
  onContextMenu: (e: React.MouseEvent, taskId: string) => void
  onReorder: (ids: string[]) => void
  editingTaskId: string | null
  deletingTaskId: string | null
  onSaveEdit: (id: string, data: { title: string; notes: string }) => void
  onCancelEdit: () => void
  onConfirmDelete: (id: string) => void
  onCancelDelete: () => void
  viewDate: string
  expandedTaskId: string | null
  onClickTask: (taskId: string) => void
}

export function TaskList({
  tasks,
  onToggleComplete,
  onContextMenu,
  onReorder,
  editingTaskId,
  deletingTaskId,
  onSaveEdit,
  onCancelEdit,
  onConfirmDelete,
  onCancelDelete,
  viewDate,
  expandedTaskId,
  onClickTask,
}: TaskListProps) {
  const incompleteTasks = tasks
    .filter((t) => !t.completed)
    .sort(compareTasksForDisplay)

  const completedTasks = tasks
    .filter((t) => t.completed)
    .sort(compareTasksForDisplay)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = incompleteTasks.findIndex((t) => t.id === active.id)
    const newIndex = incompleteTasks.findIndex((t) => t.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const activeTask = incompleteTasks[oldIndex]
    const overTask = incompleteTasks[newIndex]
    if (!canReorderTasks(activeTask, overTask)) {
      return
    }

    const reordered = arrayMove(incompleteTasks, oldIndex, newIndex)
    onReorder(reordered.map((t) => t.id))
  }

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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={incompleteTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {incompleteTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onContextMenu={(e) => onContextMenu(e, task.id)}
              isEditing={editingTaskId === task.id}
              isDeleting={deletingTaskId === task.id}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onConfirmDelete={onConfirmDelete}
              onCancelDelete={onCancelDelete}
              isDraggable={true}
              isExpanded={expandedTaskId === task.id}
              onClickRow={() => onClickTask(task.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {completedTasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onContextMenu={(e) => onContextMenu(e, task.id)}
          isEditing={editingTaskId === task.id}
          isDeleting={deletingTaskId === task.id}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onConfirmDelete={onConfirmDelete}
          onCancelDelete={onCancelDelete}
          isDraggable={false}
          isExpanded={expandedTaskId === task.id}
          onClickRow={() => onClickTask(task.id)}
        />
      ))}
    </div>
  )
}
