import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FoodView } from '../src/renderer/food/FoodView'
import { useFoodStore } from '../src/renderer/food/food-store'

vi.mock('../src/renderer/shell/ModuleHeader', () => ({
  ModuleHeader: ({ right }: { right?: React.ReactNode }) => (
    <div>
      <div>Food header</div>
      {right}
    </div>
  ),
}))

const entries = [
  {
    id: 'entry-1',
    foodId: 'food-pizza',
    foodName: 'Pizza',
    mealType: 'lunch' as const,
    mealTime: '2026-05-06T12:30:00.000Z',
    date: '2026-05-06',
    notes: 'Two slices',
    createdAt: '2026-05-06T12:30:00.000Z',
    updatedAt: '2026-05-06T12:30:00.000Z',
  },
  {
    id: 'entry-2',
    foodId: 'food-rice',
    foodName: 'Rice bowl',
    mealType: 'dinner' as const,
    mealTime: '2026-05-05T19:00:00.000Z',
    date: '2026-05-05',
    notes: null,
    createdAt: '2026-05-05T19:00:00.000Z',
    updatedAt: '2026-05-05T19:00:00.000Z',
  },
]

function createFoodApiMock() {
  return {
    listEntries: vi.fn().mockResolvedValue(entries),
    createEntry: vi.fn().mockResolvedValue(entries[0]),
    updateEntry: vi.fn().mockResolvedValue(undefined),
    deleteEntry: vi.fn().mockResolvedValue(undefined),
    suggestFoods: vi.fn().mockResolvedValue([]),
    getGroupingSuggestion: vi.fn().mockResolvedValue(null),
    suppressGroupingSuggestion: vi.fn().mockResolvedValue(undefined),
    setFoodGroup: vi.fn().mockResolvedValue(undefined),
    getAnalytics: vi.fn().mockResolvedValue({
      period: 'week',
      date: '2026-05-06',
      startDate: '2026-05-04',
      endDate: '2026-05-10',
      totalEntries: 2,
      mostEatenFoods: [
        { foodId: 'food-pizza', name: 'Pizza', count: 1 },
        { foodId: 'food-rice', name: 'Rice bowl', count: 1 },
      ],
    }),
  }
}

describe('FoodView', () => {
  beforeEach(() => {
    window.api = {
      food: createFoodApiMock(),
    } as typeof window.api
    useFoodStore.setState({
      entries: [],
      analytics: null,
      filters: {},
      suggestions: [],
      entriesLoaded: false,
      analyticsLoaded: false,
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders the default recent journal', async () => {
    render(<FoodView />)

    const journal = await screen.findByLabelText('Recent meal journal')
    expect(journal).toBeInTheDocument()
    expect(within(journal).getByText('Pizza')).toBeInTheDocument()
    expect(within(journal).getByText('Rice bowl')).toBeInTheDocument()
  })

  it('shows a search/filter count summary above matching entries', async () => {
    render(<FoodView />)

    fireEvent.change(screen.getByLabelText('Search food history'), {
      target: { value: 'pizza' },
    })

    await waitFor(() => {
      expect(window.api.food.listEntries).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'pizza' })
      )
    })
    expect(screen.getByLabelText('Food filter counts')).toBeInTheDocument()
  })

  it('opens the edit modal from the journal', async () => {
    render(<FoodView />)

    await screen.findByLabelText('Recent meal journal')
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0])

    expect(screen.getByRole('dialog', { name: 'Edit meal' })).toBeInTheDocument()
  })

  it('loads analytics when the period toggle changes', async () => {
    render(<FoodView />)

    fireEvent.click(await screen.findByRole('button', { name: 'month' }))

    await waitFor(() => {
      expect(window.api.food.getAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({ period: 'month' })
      )
    })
  })

  it('saves group management from the food detail panel', async () => {
    render(<FoodView />)

    const journal = await screen.findByLabelText('Recent meal journal')
    fireEvent.click(within(journal).getByRole('button', { name: /Pizza/ }))
    expect(screen.getByLabelText('Food detail')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Food group'), {
      target: { value: 'food-rice' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save group' }))

    await waitFor(() => {
      expect(window.api.food.setFoodGroup).toHaveBeenCalledWith({
        foodId: 'food-pizza',
        groupFoodId: 'food-rice',
      })
    })
  })
})
