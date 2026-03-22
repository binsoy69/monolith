import { create } from 'zustand'
import type { HabitKind } from '../../shared/domain-types'
import type { HabitHistoryPoint, HabitWithToday } from '../../shared/ipc-types'
import { addToast } from '../shared/toast-store'

export type { HabitWithToday }

function isHabitCompleted(kind: HabitKind, targetCount: number | null, value: number): boolean {
  if (kind === 'count') {
    return value >= (targetCount ?? 1)
  }
  return value > 0
}

function reorderSubset(habits: HabitWithToday[], ids: string[]): HabitWithToday[] {
  const idSet = new Set(ids)
  const habitsById = new Map(habits.map((habit) => [habit.id, habit]))
  const reorderedSubset = ids
    .map((id) => habitsById.get(id))
    .filter((habit): habit is HabitWithToday => habit !== undefined)
  let subsetIndex = 0

  return habits.map((habit) => {
    if (!idSet.has(habit.id)) {
      return habit
    }
    const nextHabit = reorderedSubset[subsetIndex]
    subsetIndex += 1
    return nextHabit
  })
}

interface HabitsStore {
  habits: HabitWithToday[]
  isLoaded: boolean
  showArchived: boolean
  historyByHabitId: Record<string, HabitHistoryPoint[]>
  loadingHistoryIds: string[]
  load: (date: string) => Promise<void>
  loadHistory: (habitId: string, endDate: string, days: number) => Promise<void>
  toggleComplete: (habitId: string, date: string) => Promise<void>
  reorderHabits: (ids: string[]) => Promise<void>
  incrementCount: (habitId: string, date: string) => Promise<void>
  resetCount: (habitId: string, date: string) => Promise<void>
  createHabit: (data: { name: string; daysOfWeek: string; kind?: HabitKind; targetCount?: number | null }) => Promise<void>
  updateHabit: (id: string, data: { name?: string; daysOfWeek?: string; kind?: HabitKind; targetCount?: number | null }) => Promise<void>
  archiveHabit: (id: string) => Promise<void>
  setShowArchived: (show: boolean) => void
}

export const useHabitsStore = create<HabitsStore>((set, get) => ({
  habits: [],
  isLoaded: false,
  showArchived: false,
  historyByHabitId: {},
  loadingHistoryIds: [],

  load: async (date: string) => {
    const habits = await window.api.habits.getToday(date)
    set({ habits, isLoaded: true })
  },

  loadHistory: async (habitId: string, endDate: string, days: number) => {
    if (get().loadingHistoryIds.includes(habitId)) {
      return
    }

    set((state) => ({ loadingHistoryIds: [...state.loadingHistoryIds, habitId] }))

    try {
      const points = await window.api.habits.getHistory({ habitId, endDate, days })
      set((state) => ({
        historyByHabitId: { ...state.historyByHabitId, [habitId]: points },
        loadingHistoryIds: state.loadingHistoryIds.filter((id) => id !== habitId),
      }))
    } catch {
      set((state) => ({
        loadingHistoryIds: state.loadingHistoryIds.filter((id) => id !== habitId),
      }))
      addToast({ type: 'error', message: 'Failed to load habit history.' })
    }
  },

  toggleComplete: async (habitId: string, date: string) => {
    const { habits } = get()
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return

    if (habit.kind === 'count') {
      await get().incrementCount(habitId, date)
      return
    }

    // OPTIMISTIC: flip completedToday immediately
    const wasCompleted = habit.completedToday
    set({
      habits: habits.map((h) =>
        h.id === habitId
          ? { ...h, completedToday: !wasCompleted, todayValue: wasCompleted ? 0 : 1 }
          : h
      ),
    })

    try {
      const result = wasCompleted
        ? await window.api.habits.uncomplete({ habitId, date })
        : await window.api.habits.complete({ habitId, date })

      // Update streak numbers from server response
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                completedToday: !wasCompleted,
                todayValue: wasCompleted ? 0 : 1,
                currentStreak: result.currentStreak,
                bestStreak: result.bestStreak,
              }
            : h
        ),
      }))
    } catch {
      // Rollback optimistic update
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === habitId
            ? { ...h, completedToday: wasCompleted, todayValue: wasCompleted ? 1 : 0 }
            : h
        ),
      }))
      addToast({ type: 'error', message: 'Failed to save habit. Changes were not applied.' })
    }
  },

  reorderHabits: async (ids: string[]) => {
    const previousHabits = get().habits
    set({ habits: reorderSubset(previousHabits, ids) })

    try {
      await window.api.habits.reorder({ ids })
    } catch {
      set({ habits: previousHabits })
      addToast({ type: 'error', message: 'Failed to save habit order. Changes were not applied.' })
    }
  },

  incrementCount: async (habitId: string, date: string) => {
    const previousHabits = get().habits
    const habit = previousHabits.find((item) => item.id === habitId)
    if (!habit) return

    const nextValue = habit.todayValue + 1
    set({
      habits: previousHabits.map((item) =>
        item.id === habitId
          ? {
              ...item,
              todayValue: nextValue,
              completedToday: isHabitCompleted(item.kind, item.targetCount, nextValue),
            }
          : item
      ),
    })

    try {
      const result = await window.api.habits.incrementCount({ habitId, date })
      set((state) => ({
        habits: state.habits.map((item) =>
          item.id === habitId
            ? {
                ...item,
                todayValue: result.todayValue,
                completedToday: result.completedToday,
                currentStreak: result.currentStreak,
                bestStreak: result.bestStreak,
              }
            : item
        ),
      }))
    } catch {
      set({ habits: previousHabits })
      addToast({ type: 'error', message: 'Failed to save habit count. Changes were not applied.' })
    }
  },

  resetCount: async (habitId: string, date: string) => {
    const previousHabits = get().habits
    set({
      habits: previousHabits.map((item) =>
        item.id === habitId
          ? { ...item, todayValue: 0, completedToday: false }
          : item
      ),
    })

    try {
      const result = await window.api.habits.resetCount({ habitId, date })
      set((state) => ({
        habits: state.habits.map((item) =>
          item.id === habitId
            ? {
                ...item,
                todayValue: result.todayValue,
                completedToday: result.completedToday,
                currentStreak: result.currentStreak,
                bestStreak: result.bestStreak,
              }
            : item
        ),
      }))
    } catch {
      set({ habits: previousHabits })
      addToast({ type: 'error', message: 'Failed to reset habit count. Changes were not applied.' })
    }
  },

  createHabit: async (data: { name: string; daysOfWeek: string; kind?: HabitKind; targetCount?: number | null }) => {
    await window.api.habits.create(data)
    // Reload to get updated list with streaks
    const currentDate = getTodayDateStr()
    await get().load(currentDate)
  },

  updateHabit: async (id: string, data: { name?: string; daysOfWeek?: string; kind?: HabitKind; targetCount?: number | null }) => {
    await window.api.habits.update({ id, ...data })
    const currentDate = getTodayDateStr()
    await get().load(currentDate)
  },

  archiveHabit: async (id: string) => {
    const { habits } = get()
    const removedHabit = habits.find((h) => h.id === id)

    // OPTIMISTIC: remove from list immediately
    set({ habits: habits.filter((h) => h.id !== id) })

    try {
      await window.api.habits.archive(id)
    } catch {
      // Rollback: add the habit back
      if (removedHabit) {
        set((state) => ({ habits: [...state.habits, removedHabit] }))
      }
      addToast({ type: 'error', message: 'Failed to save habit. Changes were not applied.' })
    }
  },

  setShowArchived: (show: boolean) => {
    set({ showArchived: show })
  },
}))

/**
 * Get today's date as YYYY-MM-DD string in local timezone.
 * Mirrors the server-side getTodayStr logic (pure JS, no date-fns).
 */
function getTodayDateStr(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
