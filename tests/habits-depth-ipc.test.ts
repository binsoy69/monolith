// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'

// We expect these pure/repository functions to be implemented in Phase 4.
// For now, they might not exist, but this establishes the Wave 0 test contract.
import { HabitRepository } from '../src/main/repositories/HabitRepository'

function createTestDb(): Database.Database {
  const db = new Database(':memory:')
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      days_of_week TEXT NOT NULL DEFAULT '1111111',
      kind TEXT NOT NULL DEFAULT 'boolean',
      target_count INTEGER NOT NULL DEFAULT 1,
      archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS habit_completions (
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      value INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (habit_id, date),
      FOREIGN KEY (habit_id) REFERENCES habits(id)
    );
  `)
  return db
}

describe('Habits Depth & IPC Features', () => {
  let db: Database.Database
  let repo: HabitRepository

  beforeEach(() => {
    db = createTestDb()
    repo = new HabitRepository(db)
  })

  it('boolean habit completes with value = 1', () => {
    db.prepare('INSERT INTO habits (id, name, days_of_week, kind, target_count, created_at, position) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('h1', 'Drink Water', '1111111', 'boolean', 1, '2026-03-01T00:00:00Z', 0)

    repo.markComplete('h1', '2026-03-21', 1)

    const completions = db.prepare('SELECT value FROM habit_completions WHERE habit_id = ? AND date = ?').get('h1', '2026-03-21') as { value: number }
    expect(completions).toBeDefined()
    expect(completions.value).toBe(1)
    expect(repo.isCompleted('h1', '2026-03-21')).toBe(true)
  })

  it('count habit with target_count = 8 is not completed at value = 7', () => {
    db.prepare('INSERT INTO habits (id, name, days_of_week, kind, target_count, created_at, position) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('h2', 'Read 8 Pages', '1111111', 'count', 8, '2026-03-01T00:00:00Z', 0)

    repo.markComplete('h2', '2026-03-21', 7)

    const completions = db.prepare('SELECT value FROM habit_completions WHERE habit_id = ? AND date = ?').get('h2', '2026-03-21') as { value: number }
    expect(completions).toBeDefined()
    expect(completions.value).toBe(7)
    expect(repo.isCompleted('h2', '2026-03-21')).toBe(false)
  })

  it('count habit with target_count = 8 is completed at value = 8', () => {
    db.prepare('INSERT INTO habits (id, name, days_of_week, kind, target_count, created_at, position) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('h3', 'Read 8 Pages', '1111111', 'count', 8, '2026-03-01T00:00:00Z', 0)

    repo.markComplete('h3', '2026-03-21', 8)

    const completions = db.prepare('SELECT value FROM habit_completions WHERE habit_id = ? AND date = ?').get('h3', '2026-03-21') as { value: number }
    expect(completions).toBeDefined()
    expect(completions.value).toBe(8)
    expect(repo.isCompleted('h3', '2026-03-21')).toBe(true)
  })

  it('history window returns the requested date span and completion flags', () => {
    db.prepare('INSERT INTO habits (id, name, days_of_week, kind, target_count, created_at, position) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('h4', 'Read Pages', '1111111', 'count', 3, '2026-03-01T00:00:00Z', 0)

    repo.markComplete('h4', '2026-03-15', 2)
    repo.markComplete('h4', '2026-03-16', 3)
    repo.markComplete('h4', '2026-03-18', 4)

    const window = repo.getCompletionWindow('h4', '2026-03-15', '2026-03-18')

    expect(window).toEqual([
      { date: '2026-03-15', value: 2, completed: false },
      { date: '2026-03-16', value: 3, completed: true },
      { date: '2026-03-17', value: 0, completed: false },
      { date: '2026-03-18', value: 4, completed: true },
    ])
  })

  it('reorder writes positions in the supplied id order', () => {
    db.prepare('INSERT INTO habits (id, name, days_of_week, kind, target_count, created_at, position) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('h1', 'Habit A', '1111111', 'boolean', 1, '2026-03-01T00:00:00Z', 0)
    db.prepare('INSERT INTO habits (id, name, days_of_week, kind, target_count, created_at, position) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('h2', 'Habit B', '1111111', 'boolean', 1, '2026-03-01T00:00:00Z', 1)
    db.prepare('INSERT INTO habits (id, name, days_of_week, kind, target_count, created_at, position) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('h3', 'Habit C', '1111111', 'boolean', 1, '2026-03-01T00:00:00Z', 2)

    repo.reorder(['h3', 'h1', 'h2'])

    const getPos = (id: string) =>
      (db.prepare('SELECT position FROM habits WHERE id = ?').get(id) as { position: number }).position

    expect(getPos('h3')).toBe(0)
    expect(getPos('h1')).toBe(1)
    expect(getPos('h2')).toBe(2)
  })
})
