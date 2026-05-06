import React from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MealQuickAdd, inferMealType } from '../src/renderer/food/MealQuickAdd'
import { useFoodStore } from '../src/renderer/food/food-store'

const savedEntry = {
  id: 'entry-1',
  foodId: 'food-1',
  foodName: 'Piza',
  mealType: 'lunch' as const,
  mealTime: '2026-05-06T12:30:00.000Z',
  date: '2026-05-06',
  notes: null,
  createdAt: '2026-05-06T12:30:00.000Z',
  updatedAt: '2026-05-06T12:30:00.000Z',
}

function createFoodApiMock() {
  return {
    listEntries: vi.fn().mockResolvedValue([]),
    createEntry: vi.fn().mockResolvedValue(savedEntry),
    updateEntry: vi.fn().mockResolvedValue(undefined),
    deleteEntry: vi.fn().mockResolvedValue(undefined),
    suggestFoods: vi.fn().mockResolvedValue([]),
    getGroupingSuggestion: vi.fn().mockResolvedValue({
      inputName: 'Piza',
      inputNormalized: 'piza',
      suggestedFood: {
        id: 'food-pizza',
        name: 'Pizza',
        normalizedName: 'pizza',
        groupFoodId: null,
        createdAt: '2026-05-01T00:00:00.000Z',
        updatedAt: '2026-05-01T00:00:00.000Z',
      },
      score: 430,
    }),
    suppressGroupingSuggestion: vi.fn().mockResolvedValue(undefined),
    setFoodGroup: vi.fn().mockResolvedValue(undefined),
    getAnalytics: vi.fn().mockResolvedValue(null),
  }
}

describe('MealQuickAdd', () => {
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

  it('infers meal type from local hours and lets the user edit it', () => {
    expect(inferMealType(new Date(2026, 4, 6, 9))).toBe('breakfast')
    expect(inferMealType(new Date(2026, 4, 6, 12))).toBe('lunch')
    expect(inferMealType(new Date(2026, 4, 6, 19))).toBe('dinner')
    expect(inferMealType(new Date(2026, 4, 6, 22))).toBe('snack')

    render(<MealQuickAdd />)
    fireEvent.change(screen.getByLabelText('Meal type'), { target: { value: 'snack' } })
    expect(screen.getByLabelText('Meal type')).toHaveValue('snack')
  })

  it('keeps notes hidden until requested', () => {
    render(<MealQuickAdd />)
    expect(screen.queryByLabelText('Meal notes')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Add notes' }))
    expect(screen.getByLabelText('Meal notes')).toBeInTheDocument()
  })

  it('requires explicit grouping confirmation before sending confirmedGroupFoodId', async () => {
    render(<MealQuickAdd />)

    fireEvent.change(screen.getByLabelText('Food name'), { target: { value: 'Piza' } })
    fireEvent.blur(screen.getByLabelText('Food name'))

    await screen.findByText('Group with Pizza?')
    fireEvent.click(screen.getByRole('button', { name: 'Confirm group' }))
    fireEvent.click(screen.getByRole('button', { name: 'Log meal' }))

    await waitFor(() => {
      expect(window.api.food.createEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          foodName: 'Piza',
          confirmedGroupFoodId: 'food-pizza',
        })
      )
    })
  })

  it('suppresses a grouping suggestion from quick-add', async () => {
    render(<MealQuickAdd />)

    fireEvent.change(screen.getByLabelText('Food name'), { target: { value: 'Piza' } })
    fireEvent.blur(screen.getByLabelText('Food name'))

    await screen.findByText('Group with Pizza?')
    fireEvent.click(screen.getByRole('button', { name: 'Never suggest this' }))

    await waitFor(() => {
      expect(window.api.food.suppressGroupingSuggestion).toHaveBeenCalledWith({
        inputName: 'Piza',
        suggestedFoodId: 'food-pizza',
      })
    })
  })
})
