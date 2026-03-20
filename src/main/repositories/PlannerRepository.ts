import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import type { Task } from '../../shared/domain-types'

interface TaskRow {
  id: string
  title: string
  notes: string | null
  date: string
  completed: number
  position: number
  created_at: string
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
  }
}

export class PlannerRepository {
  constructor(private readonly db: Database.Database) {}

  listForDate(date: string): Task[] {
    const rows = this.db
      .prepare(
        'SELECT id, title, notes, date, completed, position, created_at FROM tasks WHERE date = ? ORDER BY completed ASC, position ASC, created_at ASC'
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

    this.db
      .prepare(
        'INSERT INTO tasks (id, title, notes, date, completed, position, priority, created_at) VALUES (?, ?, ?, ?, 0, ?, 0, ?)'
      )
      .run(id, data.title, data.notes ?? null, data.date, nextPosition, now)

    const row = this.db
      .prepare('SELECT id, title, notes, date, completed, position, created_at FROM tasks WHERE id = ?')
      .get(id) as TaskRow
    return mapTask(row)
  }

  update(id: string, data: { title?: string; notes?: string; date?: string; completed?: boolean }): void {
    const fields: string[] = []
    const values: (string | number)[] = []

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
    }
    if (data.completed !== undefined) {
      fields.push('completed = ?')
      values.push(data.completed ? 1 : 0)
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
}
