import { create } from 'zustand'
import type { Food, MealEntry, MealType } from '../../shared/domain-types'
import type { FoodAnalytics } from '../../shared/ipc-types'
import { addToast } from '../shared/toast-store'

export interface FoodFilters {
  startDate?: string
  endDate?: string
  foodId?: string
  query?: string
}

interface FoodStore {
  entries: MealEntry[]
  analytics: FoodAnalytics | null
  filters: FoodFilters
  suggestions: Food[]
  entriesLoaded: boolean
  analyticsLoaded: boolean
  loadEntries: () => Promise<void>
  loadAnalytics: (date: string, period: 'week' | 'month') => Promise<void>
  suggestFoods: (query: string) => Promise<void>
  createEntry: (data: {
    foodName: string
    mealType: MealType
    mealTime: string
    notes?: string
    confirmedGroupFoodId?: string | null
  }) => Promise<MealEntry | null>
  updateEntry: (
    id: string,
    data: {
      foodName?: string
      mealType?: MealType
      mealTime?: string
      notes?: string | null
      confirmedGroupFoodId?: string | null
    }
  ) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  setFoodGroup: (foodId: string, groupFoodId: string | null) => Promise<void>
  setFilters: (filters: Partial<FoodFilters>) => void
  clearFilters: () => void
}

function sortEntries(entries: MealEntry[]): MealEntry[] {
  return [...entries].sort((a, b) => b.mealTime.localeCompare(a.mealTime))
}

export const useFoodStore = create<FoodStore>((set, get) => ({
  entries: [],
  analytics: null,
  filters: {},
  suggestions: [],
  entriesLoaded: false,
  analyticsLoaded: false,

  loadEntries: async () => {
    try {
      const filters = get().filters
      const entries = await window.api.food.listEntries(
        Object.keys(filters).length > 0 ? filters : undefined
      )
      set({ entries, entriesLoaded: true })
    } catch {
      addToast({ type: 'error', message: 'Failed to load meals.' })
    }
  },

  loadAnalytics: async (date, period) => {
    try {
      const analytics = await window.api.food.getAnalytics({ date, period })
      set({ analytics, analyticsLoaded: true })
    } catch {
      addToast({ type: 'error', message: 'Failed to load food analytics.' })
    }
  },

  suggestFoods: async (query) => {
    if (!query.trim()) {
      set({ suggestions: [] })
      return
    }

    try {
      const suggestions = await window.api.food.suggestFoods({ query, limit: 8 })
      set({ suggestions })
    } catch {
      set({ suggestions: [] })
    }
  },

  createEntry: async (data) => {
    const previousEntries = get().entries
    const tempId = `temp-${crypto.randomUUID()}`
    const optimisticEntry: MealEntry = {
      id: tempId,
      foodId: `temp-food-${tempId}`,
      foodName: data.foodName,
      mealType: data.mealType,
      mealTime: data.mealTime,
      date: data.mealTime.slice(0, 10),
      notes: data.notes ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    set((state) => ({ entries: sortEntries([optimisticEntry, ...state.entries]) }))

    try {
      const entry = await window.api.food.createEntry(data)
      set((state) => ({
        entries: sortEntries(state.entries.map((item) => (item.id === tempId ? entry : item))),
      }))
      return entry
    } catch {
      set({ entries: previousEntries })
      addToast({ type: 'error', message: 'Failed to save meal. Changes were not applied.' })
      return null
    }
  },

  updateEntry: async (id, data) => {
    const previousEntries = get().entries
    const current = previousEntries.find((entry) => entry.id === id)
    if (!current) return

    const nextMealTime = data.mealTime ?? current.mealTime
    set((state) => ({
      entries: sortEntries(
        state.entries.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                foodName: data.foodName ?? entry.foodName,
                mealType: data.mealType ?? entry.mealType,
                mealTime: nextMealTime,
                date: nextMealTime.slice(0, 10),
                notes: data.notes === undefined ? entry.notes : data.notes,
                updatedAt: new Date().toISOString(),
              }
            : entry
        )
      ),
    }))

    try {
      await window.api.food.updateEntry({ id, ...data })
    } catch {
      set({ entries: previousEntries })
      addToast({ type: 'error', message: 'Failed to update meal. Changes were not applied.' })
    }
  },

  deleteEntry: async (id) => {
    const previousEntries = get().entries
    set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) }))

    try {
      await window.api.food.deleteEntry(id)
    } catch {
      set({ entries: previousEntries })
      addToast({ type: 'error', message: 'Failed to delete meal. Changes were not applied.' })
    }
  },

  setFoodGroup: async (foodId, groupFoodId) => {
    try {
      await window.api.food.setFoodGroup({ foodId, groupFoodId })
      await get().loadEntries()
    } catch {
      addToast({ type: 'error', message: 'Failed to update food group.' })
    }
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }))
  },

  clearFilters: () => {
    set({ filters: {} })
  },
}))
