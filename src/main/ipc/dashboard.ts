import { ipcMain } from 'electron'
import Database from 'better-sqlite3'
import { getDb } from '../db/connection'
import { HabitRepository } from '../repositories/HabitRepository'
import { calculateStreaks } from '../utils/streaks'
import type { DashboardData } from '../../shared/ipc-types'

/**
 * Pure aggregation function — extracted for testability.
 * Called by the IPC handler and directly by unit tests.
 */
export function getDashboardData(db: Database.Database, date: string): DashboardData {
  // --- Habits ---
  const habitRepo = new HabitRepository(db)
  const activeHabits = habitRepo.listActive()

  // Filter by daysOfWeek bitmask for the given date's day-of-week
  // Use noon local time to avoid DST boundary issues
  const dayIndex = new Date(date + 'T12:00:00').getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const scheduledHabits = activeHabits.filter((h) => h.daysOfWeek[dayIndex] === '1')

  // Get completions for today
  const completedIds = new Set(habitRepo.getCompletionsForDate(date))
  const completed = scheduledHabits.filter((h) => completedIds.has(h.id)).length

  // Build streak highlights: top 2 by currentStreak (non-zero only)
  const habitsWithStreaks = scheduledHabits.map((habit) => {
    const completionHistory = habitRepo.getCompletionHistory(habit.id)
    const streaks = calculateStreaks(habit, completionHistory)
    return { name: habit.name, currentStreak: streaks.currentStreak }
  })

  const streakHighlights = habitsWithStreaks
    .filter((h) => h.currentStreak > 0)
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, 2)

  // --- Tasks ---
  // Today's incomplete tasks (up to first 5 for the list)
  const todayTasks = (
    db
      .prepare(
        'SELECT id, title FROM tasks WHERE date = ? AND completed = 0 ORDER BY position ASC, created_at ASC'
      )
      .all(date) as Array<{ id: string; title: string }>
  )

  const todayIncomplete = todayTasks.slice(0, 5).map((t) => ({ id: t.id, title: t.title }))
  const totalIncomplete = todayTasks.length

  // Overdue: tasks with date < today and completed = 0
  const overdueResult = db
    .prepare('SELECT COUNT(*) as n FROM tasks WHERE date < ? AND completed = 0')
    .get(date) as { n: number }
  const overdueCount = overdueResult.n

  // --- Spending ---
  const todayTotalResult = db
    .prepare('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date = ?')
    .get(date) as { total: number }
  const todayTotal = todayTotalResult.total

  const topCategoriesRows = db
    .prepare(
      `SELECT c.name, COALESCE(c.color, '') as color, SUM(e.amount) as amount
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.date = ?
       GROUP BY e.category_id
       ORDER BY amount DESC
       LIMIT 3`
    )
    .all(date) as Array<{ name: string; color: string; amount: number }>

  return {
    habits: {
      total: scheduledHabits.length,
      completed,
      streakHighlights,
    },
    tasks: {
      todayIncomplete,
      totalIncomplete,
      overdueCount,
    },
    spending: {
      todayTotal,
      topCategories: topCategoriesRows,
    },
  }
}

export function registerDashboardHandlers(): void {
  ipcMain.handle('dashboard:getToday', (_, date: string) => {
    const db = getDb()
    return getDashboardData(db, date)
  })
}
