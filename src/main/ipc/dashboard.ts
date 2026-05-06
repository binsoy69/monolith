import { ipcMain } from 'electron'
import Database from 'better-sqlite3'
import { getDb } from '../db/connection'
import { HabitRepository } from '../repositories/HabitRepository'
import { PlannerRepository } from '../repositories/PlannerRepository'
import { calculateStreaks, getTodayStr } from '../utils/streaks'
import type { DashboardData } from '../../shared/ipc-types'

function hasTable(db: Database.Database, tableName: string): boolean {
  const row = db
    .prepare('SELECT 1 FROM sqlite_master WHERE type = ? AND name = ? LIMIT 1')
    .get('table', tableName) as { 1: number } | undefined
  return row !== undefined
}

function getDateRange(date: string, period: 'week' | 'month'): { startDate: string; endDate: string } {
  const dateValue = new Date(`${date}T12:00:00`)

  function formatDate(value: Date): string {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  }

  if (period === 'month') {
    return {
      startDate: formatDate(new Date(dateValue.getFullYear(), dateValue.getMonth(), 1)),
      endDate: formatDate(new Date(dateValue.getFullYear(), dateValue.getMonth() + 1, 0)),
    }
  }

  const day = dateValue.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const start = new Date(dateValue)
  start.setDate(dateValue.getDate() + mondayOffset)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  }
}

function getFoodDashboardData(db: Database.Database, date: string): DashboardData['food'] {
  if (!hasTable(db, 'meal_entries') || !hasTable(db, 'foods')) {
    return {
      mealsToday: 0,
      mostEatenThisWeek: [],
      mostEatenThisMonth: [],
    }
  }

  const mealsTodayRow = db
    .prepare('SELECT COUNT(*) AS count FROM meal_entries WHERE date = ?')
    .get(date) as { count: number }

  function topFoods(period: 'week' | 'month'): DashboardData['food']['mostEatenThisWeek'] {
    const { startDate, endDate } = getDateRange(date, period)
    return db
      .prepare(
        `SELECT
           COALESCE(g.id, f.id) AS foodId,
           COALESCE(g.name, f.name) AS name,
           COUNT(m.id) AS count
         FROM meal_entries m
         JOIN foods f ON f.id = m.food_id
         LEFT JOIN foods g ON g.id = f.group_food_id
         WHERE m.date >= ? AND m.date <= ?
         GROUP BY COALESCE(g.id, f.id), COALESCE(g.name, f.name)
         ORDER BY count DESC, COALESCE(g.name, f.name) ASC
         LIMIT 3`
      )
      .all(startDate, endDate) as DashboardData['food']['mostEatenThisWeek']
  }

  return {
    mealsToday: mealsTodayRow.count,
    mostEatenThisWeek: topFoods('week'),
    mostEatenThisMonth: topFoods('month'),
  }
}

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

  // Get completions for today. Count habits only complete when they hit target.
  const completionValuesByHabitId = new Map(
    habitRepo.getCompletionValuesForDate(date).map((row) => [row.habitId, row.value])
  )
  const completed = scheduledHabits.filter((habit) => {
    const todayValue = completionValuesByHabitId.get(habit.id) ?? 0
    if (habit.kind === 'count') {
      return todayValue >= (habit.targetCount ?? 1)
    }
    return todayValue > 0
  }).length

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
  const plannerRepo = new PlannerRepository(db)
  if (date === getTodayStr()) {
    plannerRepo.carryForwardToDate(date)
  }

  const todayTasks = plannerRepo.listForDate(date).filter((task) => !task.completed)
  const todayIncomplete = todayTasks.slice(0, 5).map((task) => ({ id: task.id, title: task.title }))
  const totalIncomplete = todayTasks.length

  const taskColumns = db.prepare('PRAGMA table_info(tasks)').all() as Array<{ name: string }>
  const hasCarriedFromDate = taskColumns.some((column) => column.name === 'carried_from_date')
  const overdueWhere = hasCarriedFromDate
    ? 'COALESCE(carried_from_date, date) < ?'
    : 'date < ?'
  const overdueResult = db
    .prepare(`SELECT COUNT(*) as n FROM tasks WHERE completed = 0 AND ${overdueWhere}`)
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
    food: getFoodDashboardData(db, date),
  }
}

export function registerDashboardHandlers(): void {
  ipcMain.handle('dashboard:getToday', (_, date: string) => {
    const db = getDb()
    return getDashboardData(db, date)
  })
}
