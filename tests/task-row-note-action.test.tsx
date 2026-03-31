import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TaskRow } from '../src/renderer/planner/TaskRow'
import type { Task } from '../src/shared/domain-types'

const task: Task = {
  id: 'task-1',
  title: 'Draft roadmap',
  notes: null,
  date: '2026-03-31',
  completed: false,
  position: 0,
  createdAt: '2026-03-31T00:00:00Z',
  priority: 0,
  carriedFromDate: null,
}

describe('TaskRow note actions', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('offers an inline add-note action when the row is expanded', () => {
    const onOpenNotesEditor = vi.fn()

    render(
      <TaskRow
        task={task}
        onToggleComplete={() => {}}
        isDraggable={false}
        isExpanded={true}
        onOpenNotesEditor={onOpenNotesEditor}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add note' }))

    expect(onOpenNotesEditor).toHaveBeenCalledWith('task-1')
  })
})
