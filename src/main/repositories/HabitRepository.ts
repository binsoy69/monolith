import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import type { Habit } from '../../shared/domain-types'

interface HabitRow {
  id: string
  name: string
  days_of_week: string
  archived: number
  created_at: string
  position: number
}

function mapHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    daysOfWeek: row.days_of_week,
    archived: row.archived === 1,
    createdAt: row.created_at,
  }
}

export class HabitRepository {
  constructor(private readonly db: Database.Database) {}

  listActive(): Habit[] {
    const rows = this.db
      .prepare('SELECT * FROM habits WHERE archived = 0 ORDER BY position ASC, created_at ASC')
      .all() as HabitRow[]
    return rows.map(mapHabit)
  }

  listArchived(): Habit[] {
    const rows = this.db
      .prepare('SELECT * FROM habits WHERE archived = 1 ORDER BY created_at DESC')
      .all() as HabitRow[]
    return rows.map(mapHabit)
  }

  create(data: { name: string; daysOfWeek: string }): Habit {
    const id = randomUUID()
    const now = new Date().toISOString()
    this.db
      .prepare(
        'INSERT INTO habits (id, name, days_of_week, archived, created_at, position) VALUES (?, ?, ?, 0, ?, 0)'
      )
      .run(id, data.name, data.daysOfWeek, now)
    return {
      id,
      name: data.name,
      daysOfWeek: data.daysOfWeek,
      archived: false,
      createdAt: now,
    }
  }

  update(id: string, data: { name?: string; daysOfWeek?: string }): void {
    if (data.name !== undefined && data.daysOfWeek !== undefined) {
      this.db
        .prepare('UPDATE habits SET name = ?, days_of_week = ? WHERE id = ?')
        .run(data.name, data.daysOfWeek, id)
    } else if (data.name !== undefined) {
      this.db.prepare('UPDATE habits SET name = ? WHERE id = ?').run(data.name, id)
    } else if (data.daysOfWeek !== undefined) {
      this.db.prepare('UPDATE habits SET days_of_week = ? WHERE id = ?').run(data.daysOfWeek, id)
    }
  }

  archive(id: string): void {
    this.db.prepare('UPDATE habits SET archived = 1 WHERE id = ?').run(id)
  }

  getCompletionsForDate(date: string): string[] {
    const rows = this.db
      .prepare('SELECT habit_id FROM habit_completions WHERE date = ?')
      .all(date) as { habit_id: string }[]
    return rows.map((r) => r.habit_id)
  }

  markComplete(habitId: string, date: string): void {
    this.db
      .prepare('INSERT OR IGNORE INTO habit_completions (habit_id, date, value) VALUES (?, ?, 1)')
      .run(habitId, date)
  }

  markIncomplete(habitId: string, date: string): void {
    this.db
      .prepare('DELETE FROM habit_completions WHERE habit_id = ? AND date = ?')
      .run(habitId, date)
  }

  getCompletionHistory(habitId: string): string[] {
    const rows = this.db
      .prepare(
        'SELECT date FROM habit_completions WHERE habit_id = ? ORDER BY date DESC'
      )
      .all(habitId) as { date: string }[]
    return rows.map((r) => r.date)
  }
}
