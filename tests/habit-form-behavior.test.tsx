import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HabitForm } from '../src/renderer/habits/HabitForm'
import { HabitsView } from '../src/renderer/habits/HabitsView'
import { useHabitsStore } from '../src/renderer/habits/habits-store'
import type { HabitWithToday } from '../src/shared/ipc-types'

const existingHabit: HabitWithToday = {
  id: 'habit-1',
  name: 'Read',
  daysOfWeek: '1111111',
  archived: false,
  createdAt: '2026-03-01T00:00:00.000Z',
  kind: 'count',
  targetCount: 4,
  completedToday: false,
  currentStreak: 1,
  bestStreak: 3,
  todayValue: 0,
}

function installMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

function createApiMock() {
  return {
    settings: { get: vi.fn(), set: vi.fn() },
    window: { minimize: vi.fn(), maximize: vi.fn(), close: vi.fn() },
    habits: {
      getToday: vi.fn().mockResolvedValue(Array.from({ length: 12 }, (_, index) => ({
        ...existingHabit,
        id: `habit-${index + 1}`,
        name: `Habit ${index + 1}`,
      }))),
      listArchived: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      complete: vi.fn(),
      uncomplete: vi.fn(),
      getHistory: vi.fn().mockResolvedValue([]),
      reorder: vi.fn(),
      incrementCount: vi.fn(),
      setCount: vi.fn(),
      resetCount: vi.fn(),
    },
    planner: {
      listForDate: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      reorder: vi.fn(),
      getNotes: vi.fn(),
      saveNotes: vi.fn(),
      getDatesWithTasks: vi.fn(),
    },
    expenses: {
      listExpenses: vi.fn(),
      createExpense: vi.fn(),
      updateExpense: vi.fn(),
      deleteExpense: vi.fn(),
      listCategories: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      listWallets: vi.fn(),
      createWallet: vi.fn(),
      updateWallet: vi.fn(),
      adjustWalletBalance: vi.fn(),
      deleteWallet: vi.fn(),
      listWalletTransactions: vi.fn(),
      getAnalytics: vi.fn(),
    },
    dashboard: {
      getToday: vi.fn(),
    },
    tags: {
      list: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      listForItem: vi.fn().mockResolvedValue([]),
      setAssignment: vi.fn(),
      getItemsByTag: vi.fn().mockResolvedValue([]),
    },
    shell: {
      onNavigate: vi.fn(),
      onUpdateStatus: vi.fn(),
      installUpdate: vi.fn(),
    },
    search: {
      query: vi.fn().mockResolvedValue([]),
    },
  }
}

describe('Habit form behavior', () => {
  beforeEach(() => {
    installMatchMedia()
    useHabitsStore.setState({
      habits: [],
      isLoaded: false,
      showArchived: false,
      historyByHabitId: {},
      loadingHistoryIds: [],
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('reinitializes create mode after editing a count habit', async () => {
    const onSubmit = vi.fn()
    const onCancel = vi.fn()

    const { rerender } = render(
      <HabitForm
        mode="edit"
        initialName="Read"
        initialDaysOfWeek="1010101"
        initialKind="count"
        initialTargetCount={4}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    )

    expect(screen.getByLabelText('Count target')).toHaveValue(4)
    fireEvent.change(screen.getByPlaceholderText('Habit name'), { target: { value: 'Edited habit' } })

    rerender(
      <HabitForm
        mode="create"
        initialName=""
        initialDaysOfWeek="1111111"
        initialKind="boolean"
        initialTargetCount={null}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Habit name')).toHaveValue('')
    })
    expect(screen.queryByLabelText('Count target')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Count' }))
    expect(screen.getByLabelText('Count target')).toHaveValue(1)
  })

  it('scrolls the habits list to the top when opening the create form', async () => {
    const scrollTo = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      writable: true,
      value: scrollTo,
    })

    window.api = createApiMock() as typeof window.api

    render(<HabitsView />)

    fireEvent.click(await screen.findByRole('button', { name: /new habit/i }))

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(screen.getByRole('button', { name: 'Create Habit' })).toBeInTheDocument()
  })
})
