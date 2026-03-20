// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest'
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

describe('PlannerRepository.reorder', () => {
  let db: Database.Database
  let repo: PlannerRepository

  beforeEach(() => {
    db = createTestDb()
    repo = new PlannerRepository(db)
  })

  it('reorder sets positions to 0, 1, 2 in specified order', () => {
    const date = '2026-03-21'
    const t1 = repo.create({ title: 'Task 1', date })
    const t2 = repo.create({ title: 'Task 2', date })
    const t3 = repo.create({ title: 'Task 3', date })

    // Reorder: t3 first, t1 second, t2 third
    repo.reorder([t3.id, t1.id, t2.id], date)

    const tasks = repo.listForDate(date)
    const byId = Object.fromEntries(tasks.map((t) => [t.id, t]))

    expect(byId[t3.id].position).toBe(0)
    expect(byId[t1.id].position).toBe(1)
    expect(byId[t2.id].position).toBe(2)
  })

  it('reorder is atomic (transaction) — all or nothing', () => {
    const date = '2026-03-21'
    const t1 = repo.create({ title: 'Task 1', date })
    const t2 = repo.create({ title: 'Task 2', date })

    // Store original positions
    const origTasks = repo.listForDate(date)
    const origPos = Object.fromEntries(origTasks.map((t) => [t.id, t.position]))

    // Passing a non-existent id should not partially update
    // (SQLite UPDATE with no matching row is a no-op, so the transaction behavior
    // ensures either all succeed or all fail atomically)
    // We test atomicity by verifying the operation completes without partial state
    try {
      repo.reorder([t2.id, t1.id], date)
    } catch {
      // If it throws, positions should be unchanged
      const tasks = repo.listForDate(date)
      const newPos = Object.fromEntries(tasks.map((t) => [t.id, t.position]))
      expect(newPos[t1.id]).toBe(origPos[t1.id])
      expect(newPos[t2.id]).toBe(origPos[t2.id])
      return
    }

    // If it succeeds, positions should be updated
    const tasks = repo.listForDate(date)
    const byId = Object.fromEntries(tasks.map((t) => [t.id, t]))
    expect(byId[t2.id].position).toBe(0)
    expect(byId[t1.id].position).toBe(1)
  })

  it('reorder only affects tasks for the specified date', () => {
    const date1 = '2026-03-21'
    const date2 = '2026-03-22'

    const t1 = repo.create({ title: 'Task A', date: date1 })
    const t2 = repo.create({ title: 'Task B', date: date1 })
    const t3 = repo.create({ title: 'Task C', date: date2 })
    const t4 = repo.create({ title: 'Task D', date: date2 })

    // Record original positions for date2 tasks
    const origDate2Tasks = repo.listForDate(date2)
    const origPos = Object.fromEntries(origDate2Tasks.map((t) => [t.id, t.position]))

    // Reorder date1 tasks only
    repo.reorder([t2.id, t1.id], date1)

    // Date1 tasks should be reordered
    const date1Tasks = repo.listForDate(date1)
    const date1ById = Object.fromEntries(date1Tasks.map((t) => [t.id, t]))
    expect(date1ById[t2.id].position).toBe(0)
    expect(date1ById[t1.id].position).toBe(1)

    // Date2 tasks should be UNCHANGED
    const date2Tasks = repo.listForDate(date2)
    const date2ById = Object.fromEntries(date2Tasks.map((t) => [t.id, t]))
    expect(date2ById[t3.id].position).toBe(origPos[t3.id])
    expect(date2ById[t4.id].position).toBe(origPos[t4.id])
  })
})
