// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { PlannerRepository } from '../src/main/repositories/PlannerRepository'

function createTestDb(): Database.Database {
  const db = new Database(':memory:')
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      notes TEXT,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      carried_from_date TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      priority INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS daily_notes (
      date TEXT PRIMARY KEY,
      content TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );
  `)
  return db
}

describe('PlannerRepository planner depth', () => {
  let db: Database.Database
  let repo: PlannerRepository

  beforeEach(() => {
    db = createTestDb()
    repo = new PlannerRepository(db)
  })

  it('moves incomplete tasks from prior dates to today', () => {
    db.prepare(
      'INSERT INTO tasks (id, title, date, completed, position, priority, created_at) VALUES (?, ?, ?, 0, 0, 0, ?)'
    ).run('past-1', 'Past Task', '2026-03-19', '2026-03-19T00:00:00Z')

    const result = repo.carryForwardToDate('2026-03-21')
    const todayTasks = repo.listForDate('2026-03-21')
    const carriedTask = todayTasks.find((task) => task.id === 'past-1')

    expect(result.movedCount).toBe(1)
    expect(carriedTask).toBeDefined()
    expect(carriedTask?.date).toBe('2026-03-21')
    expect((carriedTask as { carriedFromDate?: string | null } | undefined)?.carriedFromDate).toBe(
      '2026-03-19'
    )
  })

  it("places carried tasks above today's original incomplete tasks", () => {
    db.prepare(
      'INSERT INTO tasks (id, title, date, completed, position, priority, created_at) VALUES (?, ?, ?, 0, ?, 0, ?)'
    ).run('past-1', 'Past Task', '2026-03-19', 0, '2026-03-19T00:00:00Z')
    db.prepare(
      'INSERT INTO tasks (id, title, date, completed, position, priority, created_at) VALUES (?, ?, ?, 0, ?, 0, ?)'
    ).run('today-1', 'Today Task', '2026-03-21', 0, '2026-03-21T00:00:00Z')

    repo.carryForwardToDate('2026-03-21')

    const tasks = repo.listForDate('2026-03-21')
    expect(tasks.map((task) => task.id)).toEqual(['past-1', 'today-1'])
  })

  it('preserves the earliest missed date across repeated carry-forward runs', () => {
    db.prepare(
      'INSERT INTO tasks (id, title, date, completed, carried_from_date, position, priority, created_at) VALUES (?, ?, ?, 0, ?, 0, 0, ?)'
    ).run('past-1', 'Older Task', '2026-03-20', '2026-03-19', '2026-03-19T00:00:00Z')

    repo.carryForwardToDate('2026-03-21')

    const task = repo.listForDate('2026-03-21').find((entry) => entry.id === 'past-1')
    expect(task?.date).toBe('2026-03-21')
    expect((task as { carriedFromDate?: string | null } | undefined)?.carriedFromDate).toBe(
      '2026-03-19'
    )
  })

  it('never moves completed tasks', () => {
    db.prepare(
      'INSERT INTO tasks (id, title, date, completed, position, priority, created_at) VALUES (?, ?, ?, 1, 0, 0, ?)'
    ).run('done-1', 'Done Task', '2026-03-19', '2026-03-19T00:00:00Z')

    const result = repo.carryForwardToDate('2026-03-21')

    expect(result.movedCount).toBe(0)
    expect(repo.listForDate('2026-03-21')).toHaveLength(0)
    expect(repo.listForDate('2026-03-19').map((task) => task.id)).toContain('done-1')
  })

  it('clears carried_from_date when a user manually changes the date', () => {
    db.prepare(
      'INSERT INTO tasks (id, title, date, completed, carried_from_date, position, priority, created_at) VALUES (?, ?, ?, 0, ?, 0, 0, ?)'
    ).run('past-1', 'Carried Task', '2026-03-21', '2026-03-19', '2026-03-19T00:00:00Z')

    repo.update('past-1', { date: '2026-03-25' })

    const row = db
      .prepare('SELECT date, carried_from_date AS carriedFromDate FROM tasks WHERE id = ?')
      .get('past-1') as { date: string; carriedFromDate: string | null }

    expect(row.date).toBe('2026-03-25')
    expect(row.carriedFromDate).toBeNull()
  })

  it('persists priority updates as 0, 1, 2, and 3', () => {
    const created = repo.create({ title: 'Important Task', date: '2026-03-21' })

    repo.update(created.id, { priority: 1 })
    expect(
      (db.prepare('SELECT priority FROM tasks WHERE id = ?').get(created.id) as { priority: number })
        .priority
    ).toBe(1)

    repo.update(created.id, { priority: 2 })
    expect(
      (db.prepare('SELECT priority FROM tasks WHERE id = ?').get(created.id) as { priority: number })
        .priority
    ).toBe(2)

    repo.update(created.id, { priority: 3 })
    expect(
      (db.prepare('SELECT priority FROM tasks WHERE id = ?').get(created.id) as { priority: number })
        .priority
    ).toBe(3)

    repo.update(created.id, { priority: 0 })

    const task = repo.listForDate('2026-03-21').find((entry) => entry.id === created.id)
    expect((task as { priority?: number } | undefined)?.priority).toBe(0)
  })

  it('orders incomplete tasks by carried status, then priority, then manual position', () => {
    db.prepare(
      'INSERT INTO tasks (id, title, date, completed, carried_from_date, position, priority, created_at) VALUES (?, ?, ?, 0, ?, ?, ?, ?)'
    ).run('carried-p2', 'Carried P2', '2026-03-21', '2026-03-19', 1, 2, '2026-03-19T00:00:00Z')
    db.prepare(
      'INSERT INTO tasks (id, title, date, completed, carried_from_date, position, priority, created_at) VALUES (?, ?, ?, 0, ?, ?, ?, ?)'
    ).run('carried-p1', 'Carried P1', '2026-03-21', '2026-03-18', 3, 1, '2026-03-18T00:00:00Z')
    db.prepare(
      'INSERT INTO tasks (id, title, date, completed, carried_from_date, position, priority, created_at) VALUES (?, ?, ?, 0, NULL, ?, ?, ?)'
    ).run('today-p1', 'Today P1', '2026-03-21', 2, 1, '2026-03-21T00:00:00Z')
    db.prepare(
      'INSERT INTO tasks (id, title, date, completed, carried_from_date, position, priority, created_at) VALUES (?, ?, ?, 0, NULL, ?, ?, ?)'
    ).run('today-none-a', 'Today none A', '2026-03-21', 0, 0, '2026-03-21T02:00:00Z')
    db.prepare(
      'INSERT INTO tasks (id, title, date, completed, carried_from_date, position, priority, created_at) VALUES (?, ?, ?, 0, NULL, ?, ?, ?)'
    ).run('today-none-b', 'Today none B', '2026-03-21', 0, 0, '2026-03-21T01:00:00Z')
    db.prepare(
      'INSERT INTO tasks (id, title, date, completed, carried_from_date, position, priority, created_at) VALUES (?, ?, ?, 1, NULL, ?, ?, ?)'
    ).run('done', 'Done', '2026-03-21', 0, 1, '2026-03-21T03:00:00Z')

    const tasks = repo.listForDate('2026-03-21')

    expect(tasks.map((task) => task.id)).toEqual([
      'carried-p1',
      'carried-p2',
      'today-p1',
      'today-none-b',
      'today-none-a',
      'done',
    ])
  })
})
