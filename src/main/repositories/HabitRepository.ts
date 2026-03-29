import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import type { Habit, HabitHistoryPoint, HabitKind } from '../../shared/domain-types'

interface HabitRow {
  id: string
  name: string
  days_of_week: string
  archived: number
  created_at: string
  position: number
  kind: HabitKind
  target_count: number | null
}

function mapHabit(row: HabitRow): Habit {
  const kind: HabitKind = row.kind === 'count' ? 'count' : 'boolean'
  return {
    id: row.id,
    name: row.name,
    daysOfWeek: row.days_of_week,
    archived: row.archived === 1,
    createdAt: row.created_at,
    kind,
    targetCount: kind === 'count' ? (row.target_count ?? 1) : null,
  }
}

function isCompleteValue(habit: Pick<Habit, 'kind' | 'targetCount'>, value: number): boolean {
  if (habit.kind === 'count') {
    return value >= (habit.targetCount ?? 1)
  }
  return value > 0
}

function assertNonNegativeInteger(value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error('Habit count must be a non-negative integer.')
  }
}

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

  getById(id: string): Habit | undefined {
    const row = this.db.prepare('SELECT * FROM habits WHERE id = ?').get(id) as HabitRow | undefined
    return row ? mapHabit(row) : undefined
  }

  create(data: { name: string; daysOfWeek: string; kind?: HabitKind; targetCount?: number | null }): Habit {
    const id = randomUUID()
    const now = new Date().toISOString()
    const kind: HabitKind = data.kind === 'count' ? 'count' : 'boolean'
    const targetCount = kind === 'count' ? Math.max(1, data.targetCount ?? 1) : null
    const positionRow = this.db
      .prepare('SELECT COALESCE(MAX(position), -1) as max_position FROM habits WHERE archived = 0')
      .get() as { max_position: number }

    this.db
      .prepare(
        'INSERT INTO habits (id, name, days_of_week, archived, created_at, position, kind, target_count) VALUES (?, ?, ?, 0, ?, ?, ?, ?)'
      )
      .run(id, data.name, data.daysOfWeek, now, positionRow.max_position + 1, kind, targetCount)
    return {
      id,
      name: data.name,
      daysOfWeek: data.daysOfWeek,
      archived: false,
      createdAt: now,
      kind,
      targetCount,
    }
  }

  update(id: string, data: { name?: string; daysOfWeek?: string; kind?: HabitKind; targetCount?: number | null }): void {
    const updates: string[] = []
    const values: Array<string | number | null> = []

    if (data.name !== undefined) {
      updates.push('name = ?')
      values.push(data.name)
    }
    if (data.daysOfWeek !== undefined) {
      updates.push('days_of_week = ?')
      values.push(data.daysOfWeek)
    }
    if (data.kind !== undefined) {
      updates.push('kind = ?')
      values.push(data.kind)
      if (data.kind === 'boolean' && data.targetCount === undefined) {
        updates.push('target_count = ?')
        values.push(null)
      }
    }
    if (data.targetCount !== undefined) {
      updates.push('target_count = ?')
      values.push(data.targetCount === null ? null : Math.max(1, data.targetCount))
    }

    if (updates.length === 0) {
      return
    }

    values.push(id)
    this.db.prepare(`UPDATE habits SET ${updates.join(', ')} WHERE id = ?`).run(...values)
  }

  archive(id: string): void {
    this.db.prepare('UPDATE habits SET archived = 1 WHERE id = ?').run(id)
  }

  reorder(ids: string[]): void {
    const updatePosition = this.db.prepare('UPDATE habits SET position = ? WHERE id = ?')
    const transaction = this.db.transaction((orderedIds: string[]) => {
      orderedIds.forEach((id, index) => {
        updatePosition.run(index, id)
      })
    })

    transaction(ids)
  }

  getCompletionsForDate(date: string): string[] {
    const rows = this.db
      .prepare('SELECT habit_id FROM habit_completions WHERE date = ?')
      .all(date) as { habit_id: string }[]
    return rows.map((r) => r.habit_id)
  }

  getCompletionValuesForDate(date: string): Array<{ habitId: string; value: number }> {
    const rows = this.db
      .prepare('SELECT habit_id, value FROM habit_completions WHERE date = ?')
      .all(date) as Array<{ habit_id: string; value: number }>
    return rows.map((row) => ({ habitId: row.habit_id, value: row.value }))
  }

  getCompletionValue(habitId: string, date: string): number {
    const row = this.db
      .prepare('SELECT value FROM habit_completions WHERE habit_id = ? AND date = ?')
      .get(habitId, date) as { value: number } | undefined
    return row?.value ?? 0
  }

  markComplete(habitId: string, date: string, value = 1): void {
    this.setCompletionValue(habitId, date, value)
  }

  markIncomplete(habitId: string, date: string): void {
    this.setCompletionValue(habitId, date, 0)
  }

  setCompletionValue(habitId: string, date: string, value: number): void {
    assertNonNegativeInteger(value)

    if (value <= 0) {
      this.db.prepare('DELETE FROM habit_completions WHERE habit_id = ? AND date = ?').run(habitId, date)
      return
    }

    this.db
      .prepare(
        `INSERT INTO habit_completions (habit_id, date, value)
         VALUES (?, ?, ?)
         ON CONFLICT(habit_id, date) DO UPDATE SET value = excluded.value`
      )
      .run(habitId, date, value)
  }

  setCount(habitId: string, date: string, value: number): void {
    assertNonNegativeInteger(value)
    this.setCompletionValue(habitId, date, value)
  }

  isCompleted(habitId: string, date: string): boolean {
    const habit = this.getById(habitId)
    if (!habit) {
      return false
    }

    return isCompleteValue(habit, this.getCompletionValue(habitId, date))
  }

  getHistoryWindow(habitId: string, startDate: string, endDate: string): Array<{ date: string; value: number }> {
    const rows = this.db
      .prepare(
        `SELECT date, value
         FROM habit_completions
         WHERE habit_id = ? AND date >= ? AND date <= ?
         ORDER BY date ASC`
      )
      .all(habitId, startDate, endDate) as Array<{ date: string; value: number }>
    return rows
  }

  getCompletionWindow(habitId: string, startDate: string, endDate: string): HabitHistoryPoint[] {
    const habit = this.getById(habitId)
    if (!habit) {
      return []
    }

    const valuesByDate = new Map(
      this.getHistoryWindow(habitId, startDate, endDate).map((row) => [row.date, row.value])
    )
    const window: HabitHistoryPoint[] = []
    const end = parseLocalDate(endDate)

    for (let cursor = parseLocalDate(startDate); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const date = formatLocalDate(cursor)
      const value = valuesByDate.get(date) ?? 0
      window.push({
        date,
        value,
        completed: isCompleteValue(habit, value),
      })
    }

    return window
  }

  getCompletionHistory(habitId: string): string[] {
    const rows = this.db
      .prepare(
        `SELECT hc.date
         FROM habit_completions hc
         JOIN habits h ON h.id = hc.habit_id
         WHERE hc.habit_id = ?
           AND (
             (h.kind = 'count' AND hc.value >= COALESCE(h.target_count, 1))
             OR
             (h.kind != 'count' AND hc.value > 0)
           )
         ORDER BY hc.date DESC`
      )
      .all(habitId) as Array<{ date: string }>
    return rows.map((row) => row.date)
  }
}
