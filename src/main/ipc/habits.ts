import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { HabitRepository } from '../repositories/HabitRepository'
import { calculateStreaks } from '../utils/streaks'

export function registerHabitsHandlers(): void {
  ipcMain.handle('habits:getToday', (_, date: string) => {
    const db = getDb()
    const repo = new HabitRepository(db)
    const habits = repo.listActive()
    const completedHabitIds = new Set(repo.getCompletionsForDate(date))

    return habits.map((habit) => {
      const completionHistory = repo.getCompletionHistory(habit.id)
      const streaks = calculateStreaks(habit, completionHistory)
      return {
        ...habit,
        completedToday: completedHabitIds.has(habit.id),
        currentStreak: streaks.currentStreak,
        bestStreak: streaks.bestStreak,
      }
    })
  })

  ipcMain.handle('habits:listArchived', () => {
    const db = getDb()
    const repo = new HabitRepository(db)
    return repo.listArchived()
  })

  ipcMain.handle('habits:create', (_, data: { name: string; daysOfWeek: string }) => {
    const db = getDb()
    const repo = new HabitRepository(db)
    return repo.create(data)
  })

  ipcMain.handle(
    'habits:update',
    (_, data: { id: string; name?: string; daysOfWeek?: string }) => {
      const db = getDb()
      const repo = new HabitRepository(db)
      repo.update(data.id, { name: data.name, daysOfWeek: data.daysOfWeek })
    }
  )

  ipcMain.handle('habits:archive', (_, id: string) => {
    const db = getDb()
    const repo = new HabitRepository(db)
    repo.archive(id)
  })

  ipcMain.handle(
    'habits:complete',
    (_, data: { habitId: string; date: string }) => {
      const db = getDb()
      const repo = new HabitRepository(db)
      repo.markComplete(data.habitId, data.date)
      const habit = db
        .prepare('SELECT days_of_week FROM habits WHERE id = ?')
        .get(data.habitId) as { days_of_week: string } | undefined
      if (!habit) return { currentStreak: 0, bestStreak: 0 }
      const completionHistory = repo.getCompletionHistory(data.habitId)
      return calculateStreaks({ daysOfWeek: habit.days_of_week }, completionHistory)
    }
  )

  ipcMain.handle(
    'habits:uncomplete',
    (_, data: { habitId: string; date: string }) => {
      const db = getDb()
      const repo = new HabitRepository(db)
      repo.markIncomplete(data.habitId, data.date)
      const habit = db
        .prepare('SELECT days_of_week FROM habits WHERE id = ?')
        .get(data.habitId) as { days_of_week: string } | undefined
      if (!habit) return { currentStreak: 0, bestStreak: 0 }
      const completionHistory = repo.getCompletionHistory(data.habitId)
      return calculateStreaks({ daysOfWeek: habit.days_of_week }, completionHistory)
    }
  )
}
