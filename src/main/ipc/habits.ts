import { ipcMain } from 'electron'
import { getDb } from '../db/connection'
import { HabitRepository } from '../repositories/HabitRepository'
import { calculateStreaks } from '../utils/streaks'
import type { Habit } from '../../shared/domain-types'

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isHabitCompleted(habit: Pick<Habit, 'kind' | 'targetCount'>, value: number): boolean {
  if (habit.kind === 'count') {
    return value >= (habit.targetCount ?? 1)
  }
  return value > 0
}

function buildProgressSnapshot(
  repo: HabitRepository,
  habit: Habit,
  habitId: string,
  todayValue: number
): { todayValue: number; completedToday: boolean; currentStreak: number; bestStreak: number } {
  const completionHistory = repo.getCompletionHistory(habitId)
  const streaks = calculateStreaks(habit, completionHistory)
  return {
    todayValue,
    completedToday: isHabitCompleted(habit, todayValue),
    currentStreak: streaks.currentStreak,
    bestStreak: streaks.bestStreak,
  }
}

export function registerHabitsHandlers(): void {
  ipcMain.handle('habits:getToday', (_, date: string) => {
    const db = getDb()
    const repo = new HabitRepository(db)
    const habits = repo.listActive()
    const completionValuesByHabitId = new Map(
      repo.getCompletionValuesForDate(date).map((row) => [row.habitId, row.value])
    )

    return habits.map((habit) => {
      const todayValue = completionValuesByHabitId.get(habit.id) ?? 0
      const progress = buildProgressSnapshot(repo, habit, habit.id, todayValue)
      return {
        ...habit,
        ...progress,
      }
    })
  })

  ipcMain.handle('habits:listArchived', () => {
    const db = getDb()
    const repo = new HabitRepository(db)
    return repo.listArchived()
  })

  ipcMain.handle('habits:create', (_, data: { name: string; daysOfWeek: string; kind?: Habit['kind']; targetCount?: number | null }) => {
    const db = getDb()
    const repo = new HabitRepository(db)
    return repo.create(data)
  })

  ipcMain.handle(
    'habits:update',
    (_, data: { id: string; name?: string; daysOfWeek?: string; kind?: Habit['kind']; targetCount?: number | null }) => {
      const db = getDb()
      const repo = new HabitRepository(db)
      repo.update(data.id, {
        name: data.name,
        daysOfWeek: data.daysOfWeek,
        kind: data.kind,
        targetCount: data.targetCount,
      })
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
      repo.setCompletionValue(data.habitId, data.date, 1)
      const habit = repo.getById(data.habitId)
      if (!habit) return { currentStreak: 0, bestStreak: 0 }
      const { currentStreak, bestStreak } = buildProgressSnapshot(repo, habit, data.habitId, 1)
      return { currentStreak, bestStreak }
    }
  )

  ipcMain.handle(
    'habits:uncomplete',
    (_, data: { habitId: string; date: string }) => {
      const db = getDb()
      const repo = new HabitRepository(db)
      repo.setCompletionValue(data.habitId, data.date, 0)
      const habit = repo.getById(data.habitId)
      if (!habit) return { currentStreak: 0, bestStreak: 0 }
      const { currentStreak, bestStreak } = buildProgressSnapshot(repo, habit, data.habitId, 0)
      return { currentStreak, bestStreak }
    }
  )

  ipcMain.handle(
    'habits:getHistory',
    (_, data: { habitId: string; endDate: string; days: number }) => {
      const db = getDb()
      const repo = new HabitRepository(db)
      const start = parseLocalDate(data.endDate)
      start.setDate(start.getDate() - (data.days - 1))
      return repo.getCompletionWindow(data.habitId, formatLocalDate(start), data.endDate)
    }
  )

  ipcMain.handle('habits:reorder', (_, data: { ids: string[] }) => {
    const db = getDb()
    const repo = new HabitRepository(db)
    repo.reorder(data.ids)
  })

  ipcMain.handle(
    'habits:incrementCount',
    (_, data: { habitId: string; date: string }) => {
      const db = getDb()
      const repo = new HabitRepository(db)
      const habit = repo.getById(data.habitId)
      if (!habit) {
        return { todayValue: 0, completedToday: false, currentStreak: 0, bestStreak: 0 }
      }

      const nextValue = repo.getCompletionValue(data.habitId, data.date) + 1
      repo.setCompletionValue(data.habitId, data.date, nextValue)
      return buildProgressSnapshot(repo, habit, data.habitId, nextValue)
    }
  )

  ipcMain.handle(
    'habits:resetCount',
    (_, data: { habitId: string; date: string }) => {
      const db = getDb()
      const repo = new HabitRepository(db)
      const habit = repo.getById(data.habitId)
      if (!habit) {
        return { todayValue: 0, completedToday: false, currentStreak: 0, bestStreak: 0 }
      }

      repo.setCompletionValue(data.habitId, data.date, 0)
      return buildProgressSnapshot(repo, habit, data.habitId, 0)
    }
  )
}
