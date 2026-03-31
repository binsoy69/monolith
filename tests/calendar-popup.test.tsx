import React from 'react'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CalendarPopup } from '../src/renderer/shared/CalendarPopup'

describe('CalendarPopup', () => {
  beforeEach(() => {
    window.api = {
      planner: {
        getDatesWithTasks: vi.fn().mockResolvedValue(['2026-03-10']),
        getDatesWithNotes: vi.fn().mockResolvedValue(['2026-03-14']),
      },
    } as typeof window.api
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('shows note indicators for days with saved notes', async () => {
    render(
      <CalendarPopup
        selectedDate="2026-03-10"
        onSelect={() => {}}
        onClose={() => {}}
        showTaskDots={true}
        showNoteIndicators={true}
      />
    )

    await waitFor(() => {
      expect(
        screen.getByTestId('calendar-note-indicator-2026-03-14')
      ).toBeInTheDocument()
    })

    expect(
      screen.getByTestId('calendar-task-indicator-2026-03-10')
    ).toBeInTheDocument()
  })
})
