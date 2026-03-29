import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HabitsView } from '../src/renderer/habits/HabitsView'
import { useHabitsStore } from '../src/renderer/habits/habits-store'
import type { HabitWithToday } from '../src/shared/ipc-types'

function getTodayDateStr(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const today = getTodayDateStr()

const countHabit: HabitWithToday = {
  id: 'count-habit',
  name: 'Words Written',
  daysOfWeek: '1111111',
  archived: false,
  createdAt: '2026-03-01T00:00:00.000Z',
  kind: 'count',
  targetCount: 8,
  completedToday: false,
  currentStreak: 2,
  bestStreak: 5,
  todayValue: 2,
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
      getToday: vi.fn().mockResolvedValue([countHabit]),
      listArchived: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      complete: vi.fn(),
      uncomplete: vi.fn(),
      getHistory: vi.fn().mockResolvedValue(
        Array.from({ length: 90 }, (_, index) => ({
          date: `2026-01-${String((index % 30) + 1).padStart(2, '0')}`,
          value: 0,
          completed: false,
        }))
      ),
      reorder: vi.fn(),
      incrementCount: vi.fn(),
      setCount: vi.fn().mockImplementation(async ({ value }: { value: number }) => ({
        todayValue: value,
        completedToday: value >= 8,
        currentStreak: value >= 8 ? 3 : 2,
        bestStreak: 5,
      })),
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
  }
}

function clickExpandToggle(): void {
  const title = screen.getByText('Words Written')
  const toggle = title.closest('[role="button"]')
  expect(toggle).not.toBeNull()
  fireEvent.click(toggle as HTMLElement)
}

describe('Habit count entry UI', () => {
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

  it('keeps the collapsed fraction pill while revealing a direct count editor in expanded details', async () => {
    const api = createApiMock()
    window.api = api as typeof window.api

    render(<HabitsView />)

    expect(await screen.findByRole('button', { name: 'Increment Words Written' })).toHaveTextContent('2/8')

    clickExpandToggle()

    expect(await screen.findByText('Direct count entry')).toBeInTheDocument()
    expect(screen.getByLabelText('Set count for Words Written')).toHaveAttribute('inputmode', 'numeric')
    expect(screen.getByText('Last 7 days')).toBeInTheDocument()
  })

  it('applies large manual counts exactly and completes only when the value reaches the target', async () => {
    const api = createApiMock()
    window.api = api as typeof window.api

    render(<HabitsView />)

    await screen.findByRole('button', { name: 'Increment Words Written' })
    clickExpandToggle()

    const input = await screen.findByLabelText('Set count for Words Written')
    fireEvent.change(input, { target: { value: '1000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(api.habits.setCount).toHaveBeenCalledWith({
        habitId: 'count-habit',
        date: today,
        value: 1000,
      })
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Increment Words Written' })).toHaveTextContent('1000/8')
    })
  })

  it('rejects blank and negative count submissions in the renderer before mutating progress', async () => {
    const api = createApiMock()
    window.api = api as typeof window.api

    render(<HabitsView />)

    await screen.findByRole('button', { name: 'Increment Words Written' })
    clickExpandToggle()

    const input = await screen.findByLabelText('Set count for Words Written')
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Enter a count before applying.')
    expect(api.habits.setCount).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Increment Words Written' })).toHaveTextContent('2/8')

    fireEvent.change(input, { target: { value: '-4' } })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Count must be a non-negative whole number.')
    expect(api.habits.setCount).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Increment Words Written' })).toHaveTextContent('2/8')
  })
})
