import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import type { Task, TaskPriority } from '../../shared/domain-types'

interface TaskRow {
  id: string
  title: string
  notes: string | null
  date: string
  completed: number
  position: number
  priority: number
  carriedFromDate: string | null
  created_at: string
}

function mapPriority(priority: number): TaskPriority {
  if (priority === 1 || priority === 2 || priority === 3) {
    return priority
  }
  return 0
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    date: row.date,
    completed: row.completed === 1,
    position: row.position,
    createdAt: row.created_at,
    priority: mapPriority(row.priority),
    carriedFromDate: row.carriedFromDate,
  }
}

export class PlannerRepository {
  private readonly hasCarriedFromDate: boolean

  constructor(private readonly db: Database.Database) {
    const taskColumns = this.db.prepare('PRAGMA table_info(tasks)').all() as Array<{ name: string }>
    this.hasCarriedFromDate = taskColumns.some((column) => column.name === 'carried_from_date')
  }

  private getSelectColumns(): string {
    if (this.hasCarriedFromDate) {
      return 'id, title, notes, date, completed, position, priority, carried_from_date as carriedFromDate, created_at'
    }
    return 'id, title, notes, date, completed, position, priority, NULL as carriedFromDate, created_at'
  }

  listForDate(date: string): Task[] {
    const rows = this.db
      .prepare(
        `SELECT ${this.getSelectColumns()}
         FROM tasks
         WHERE date = ?
         ORDER BY
           completed ASC,
           CASE
             WHEN completed = 0 AND carriedFromDate IS NOT NULL THEN 0
             WHEN completed = 0 THEN 1
             ELSE 2
           END ASC,
           CASE priority
             WHEN 1 THEN 0
             WHEN 2 THEN 1
             WHEN 3 THEN 2
             ELSE 3
           END ASC,
           position ASC,
           created_at ASC`
      )
      .all(date) as TaskRow[]
    return rows.map(mapTask)
  }

  create(data: { title: string; notes?: string; date: string }): Task {
    const id = randomUUID()
    const now = new Date().toISOString()
    const nextPosition = (
      this.db
        .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM tasks WHERE date = ?')
        .get(data.date) as { next: number }
    ).next

    if (this.hasCarriedFromDate) {
      this.db
        .prepare(
          'INSERT INTO tasks (id, title, notes, date, completed, carried_from_date, position, priority, created_at) VALUES (?, ?, ?, ?, 0, NULL, ?, 0, ?)'
        )
        .run(id, data.title, data.notes ?? null, data.date, nextPosition, now)
    } else {
      this.db
        .prepare(
          'INSERT INTO tasks (id, title, notes, date, completed, position, priority, created_at) VALUES (?, ?, ?, ?, 0, ?, 0, ?)'
        )
        .run(id, data.title, data.notes ?? null, data.date, nextPosition, now)
    }

    const row = this.db
      .prepare(`SELECT ${this.getSelectColumns()} FROM tasks WHERE id = ?`)
      .get(id) as TaskRow
    return mapTask(row)
  }

  update(id: string, data: { title?: string; notes?: string; date?: string; completed?: boolean; priority?: TaskPriority }): void {
    const fields: string[] = []
    const values: Array<string | number | null> = []

    if (data.title !== undefined) {
      fields.push('title = ?')
      values.push(data.title)
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?')
      values.push(data.notes)
    }
    if (data.date !== undefined) {
      fields.push('date = ?')
      values.push(data.date)
      if (this.hasCarriedFromDate) {
        fields.push('carried_from_date = NULL')
      }
    }
    if (data.completed !== undefined) {
      fields.push('completed = ?')
      values.push(data.completed ? 1 : 0)
    }
    if (data.priority !== undefined) {
      fields.push('priority = ?')
      values.push(data.priority)
    }

    if (fields.length === 0) return

    values.push(id)
    this.db
      .prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`)
      .run(...values)
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
  }

  reorder(ids: string[], date: string): void {
    const stmt = this.db.prepare('UPDATE tasks SET position = ? WHERE id = ? AND date = ?')
    const tx = this.db.transaction((ids: string[]) => {
      ids.forEach((id, index) => stmt.run(index, id, date))
    })
    tx(ids)
  }

  carryForwardToDate(targetDate: string): { movedCount: number } {
    if (!this.hasCarriedFromDate) {
      return { movedCount: 0 }
    }

    const overdueTasks = this.db
      .prepare(
        `SELECT id, COALESCE(carried_from_date, date) AS originalDate
         FROM tasks
         WHERE completed = 0 AND date < ?
         ORDER BY COALESCE(carried_from_date, date) ASC, position ASC, created_at ASC`
      )
      .all(targetDate) as Array<{ id: string; originalDate: string }>

    if (overdueTasks.length === 0) {
      return { movedCount: 0 }
    }

    const shiftTodayTasks = this.db.prepare(
      'UPDATE tasks SET position = position + ? WHERE date = ? AND completed = 0'
    )
    const moveTask = this.db.prepare(
      'UPDATE tasks SET date = ?, position = ?, carried_from_date = ? WHERE id = ?'
    )

    const tx = this.db.transaction((tasks: Array<{ id: string; originalDate: string }>) => {
      shiftTodayTasks.run(tasks.length, targetDate)
      tasks.forEach((task, index) => {
        moveTask.run(targetDate, index, task.originalDate, task.id)
      })
    })

    tx(overdueTasks)
    return { movedCount: overdueTasks.length }
  }

  getNotes(date: string): string {
    const row = this.db
      .prepare('SELECT content FROM daily_notes WHERE date = ?')
      .get(date) as { content: string } | undefined
    return row?.content ?? ''
  }

  saveNotes(date: string, content: string): void {
    this.db
      .prepare('INSERT OR REPLACE INTO daily_notes (date, content, updated_at) VALUES (?, ?, ?)')
      .run(date, content, new Date().toISOString())
  }

  getDatesWithTasks(month: number, year: number): string[] {
    const paddedMonth = String(month).padStart(2, '0')
    const rows = this.db
      .prepare(
        `SELECT DISTINCT date FROM tasks WHERE date LIKE ?`
      )
      .all(`${year}-${paddedMonth}-%`) as { date: string }[]
    return rows.map((r) => r.date)
  }

  getDatesWithNotes(month: number, year: number): string[] {
    const paddedMonth = String(month).padStart(2, '0')
    const rows = this.db
      .prepare(
        `SELECT date
         FROM daily_notes
         WHERE date LIKE ?
           AND LENGTH(TRIM(content)) > 0`
      )
      .all(`${year}-${paddedMonth}-%`) as { date: string }[]
    return rows.map((r) => r.date)
  }
}
