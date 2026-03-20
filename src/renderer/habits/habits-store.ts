import { create } from 'zustand'
import type { Habit } from '../../shared/domain-types'
import type { HabitWithToday } from '../../shared/ipc-types'
import { addToast } from '../shared/toast-store'

export type { HabitWithToday }

interface HabitsStore {
  habits: HabitWithToday[]
  isLoaded: boolean
  showArchived: boolean
  load: (date: string) => Promise<void>
  toggleComplete: (habitId: string, date: string) => Promise<void>
  createHabit: (data: { name: string; daysOfWeek: string }) => Promise<void>
  updateHabit: (id: string, data: { name?: string; daysOfWeek?: string }) => Promise<void>
  archiveHabit: (id: string) => Promise<void>
  setShowArchived: (show: boolean) => void
}

export const useHabitsStore = create<HabitsStore>((set, get) => ({
  habits: [],
  isLoaded: false,
  showArchived: false,

  load: async (date: string) => {
    const habits = await window.api.habits.getToday(date)
    set({ habits, isLoaded: true })
  },

  toggleComplete: async (habitId: string, date: string) => {
    const { habits } = get()
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return

    // OPTIMISTIC: flip completedToday immediately
    const wasCompleted = habit.completedToday
    set({
      habits: habits.map((h) =>
        h.id === habitId ? { ...h, completedToday: !wasCompleted } : h
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
            ? { ...h, currentStreak: result.currentStreak, bestStreak: result.bestStreak }
            : h
        ),
      }))
    } catch {
      // Rollback optimistic update
      set((state) => ({
        habits: state.habits.map((h) =>
          h.id === habitId ? { ...h, completedToday: wasCompleted } : h
        ),
      }))
      addToast({ type: 'error', message: 'Failed to save habit. Changes were not applied.' })
    }
  },

  createHabit: async (data: { name: string; daysOfWeek: string }) => {
    await window.api.habits.create(data)
    // Reload to get updated list with streaks
    const currentDate = getTodayDateStr()
    await get().load(currentDate)
  },

  updateHabit: async (id: string, data: { name?: string; daysOfWeek?: string }) => {
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
