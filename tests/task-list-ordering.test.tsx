import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TaskList, canReorderTasks, compareTasksForDisplay } from '../src/renderer/planner/TaskList'
import type { Task } from '../src/shared/domain-types'

function makeTask(overrides: Partial<Task> & Pick<Task, 'id' | 'title'>): Task {
  return {
    id: overrides.id,
    title: overrides.title,
    notes: overrides.notes ?? null,
    date: overrides.date ?? '2026-03-21',
    completed: overrides.completed ?? false,
    position: overrides.position ?? 0,
    createdAt: overrides.createdAt ?? '2026-03-21T00:00:00Z',
    priority: overrides.priority ?? 0,
    carriedFromDate: overrides.carriedFromDate ?? null,
  }
}

describe('TaskList ordering', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('sorts carried tasks above same-day tasks and applies priority within each band', () => {
    const tasks = [
      makeTask({ id: 'today-none', title: 'Today none', priority: 0, position: 0 }),
      makeTask({ id: 'carried-p2', title: 'Carried P2', priority: 2, carriedFromDate: '2026-03-20', position: 3 }),
      makeTask({ id: 'today-p1', title: 'Today P1', priority: 1, position: 5 }),
      makeTask({ id: 'carried-p1', title: 'Carried P1', priority: 1, carriedFromDate: '2026-03-19', position: 8 }),
    ]

    const ordered = [...tasks].sort(compareTasksForDisplay)

    expect(ordered.map((task) => task.id)).toEqual([
      'carried-p1',
      'carried-p2',
      'today-p1',
      'today-none',
    ])
  })

  it('keeps manual position order within the same carry and priority band', () => {
    const tasks = [
      makeTask({ id: 'later', title: 'Later', carriedFromDate: '2026-03-19', priority: 2, position: 4, createdAt: '2026-03-21T02:00:00Z' }),
      makeTask({ id: 'earlier', title: 'Earlier', carriedFromDate: '2026-03-18', priority: 2, position: 1, createdAt: '2026-03-21T03:00:00Z' }),
      makeTask({ id: 'tie-break', title: 'Tie break', carriedFromDate: '2026-03-17', priority: 2, position: 1, createdAt: '2026-03-21T01:00:00Z' }),
    ]

    const ordered = [...tasks].sort(compareTasksForDisplay)

    expect(ordered.map((task) => task.id)).toEqual(['tie-break', 'earlier', 'later'])
  })

  it('renders overdue carried tasks with their warning marker after priority sorting', () => {
    const tasks = [
      makeTask({ id: 'today-p1', title: 'Today P1', priority: 1 }),
      makeTask({ id: 'overdue', title: 'Overdue', priority: 2, carriedFromDate: '2026-03-19' }),
    ]

    render(
      <TaskList
        tasks={tasks}
        onToggleComplete={() => {}}
        onContextMenu={() => {}}
        onReorder={() => {}}
        editingTaskId={null}
        deletingTaskId={null}
        onSaveEdit={() => {}}
        onCancelEdit={() => {}}
        onConfirmDelete={() => {}}
        onCancelDelete={() => {}}
        viewDate="2026-03-21"
        expandedTaskId={null}
        onClickTask={() => {}}
      />
    )

    expect(screen.getByText('overdue')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('does not allow drag reorder across carry or priority bands', () => {
    const carriedP1 = makeTask({ id: 'carried-p1', title: 'Carried P1', priority: 1, carriedFromDate: '2026-03-19' })
    const carriedP2 = makeTask({ id: 'carried-p2', title: 'Carried P2', priority: 2, carriedFromDate: '2026-03-18' })
    const sameBandA = makeTask({ id: 'same-a', title: 'Same A', priority: 0, position: 0 })
    const sameBandB = makeTask({ id: 'same-b', title: 'Same B', priority: 0, position: 1 })

    expect(canReorderTasks(carriedP2, carriedP1)).toBe(false)
    expect(canReorderTasks(carriedP1, sameBandA)).toBe(false)
    expect(canReorderTasks(sameBandA, sameBandB)).toBe(true)
  })
})
