// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { getDashboardData } from '../src/main/ipc/dashboard'

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
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT
    );
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      balance INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      category_id TEXT NOT NULL,
      wallet_id TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `)
  return db
}

describe('getDashboardData', () => {
  let db: Database.Database

  beforeEach(() => {
    db = createTestDb()
  })

  it('Test 1: returns correct aggregated data when habits/tasks/expenses exist for the date', () => {
    const date = '2026-03-21' // Saturday = day index 6

    // Insert 2 habits scheduled on Saturdays (index 6)
    db.prepare('INSERT INTO habits (id, name, days_of_week, kind, target_count, archived, created_at, position) VALUES (?, ?, ?, ?, ?, 0, ?, 0)')
      .run('h1', 'Morning Run', '0000001', 'boolean', 1, '2026-01-01')
    db.prepare('INSERT INTO habits (id, name, days_of_week, kind, target_count, archived, created_at, position) VALUES (?, ?, ?, ?, ?, 0, ?, 0)')
      .run('h2', 'Read Book', '0000001', 'boolean', 1, '2026-01-01')

    // Complete h1 today
    db.prepare('INSERT INTO habit_completions (habit_id, date, value) VALUES (?, ?, 1)')
      .run('h1', date)

    // Insert tasks for today (2 incomplete, 1 complete)
    db.prepare('INSERT INTO tasks (id, title, notes, date, completed, position, priority, created_at) VALUES (?, ?, NULL, ?, 0, 0, 0, ?)')
      .run('t1', 'Write tests', date, '2026-03-21T08:00:00Z')
    db.prepare('INSERT INTO tasks (id, title, notes, date, completed, position, priority, created_at) VALUES (?, ?, NULL, ?, 0, 1, 0, ?)')
      .run('t2', 'Review PR', date, '2026-03-21T08:01:00Z')
    db.prepare('INSERT INTO tasks (id, title, notes, date, completed, position, priority, created_at) VALUES (?, ?, NULL, ?, 1, 2, 0, ?)')
      .run('t3', 'Done task', date, '2026-03-21T08:02:00Z')

    // Insert category and expenses
    db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)').run('c1', 'Food', '#f97316')
    db.prepare('INSERT INTO expenses (id, amount, date, category_id, notes, created_at) VALUES (?, ?, ?, ?, NULL, ?)')
      .run('e1', 15000, date, 'c1', '2026-03-21T09:00:00Z')
    db.prepare('INSERT INTO expenses (id, amount, date, category_id, notes, created_at) VALUES (?, ?, ?, ?, NULL, ?)')
      .run('e2', 5000, date, 'c1', '2026-03-21T10:00:00Z')

    const result = getDashboardData(db, date)

    expect(result.habits.total).toBe(2)
    expect(result.habits.completed).toBe(1)
    expect(result.tasks.todayIncomplete).toHaveLength(2)
    expect(result.tasks.todayIncomplete.map(t => t.title)).toContain('Write tests')
    expect(result.tasks.todayIncomplete.map(t => t.title)).toContain('Review PR')
    expect(result.tasks.totalIncomplete).toBe(2)
    expect(result.spending.todayTotal).toBe(20000)
  })

  it('Test 2: overdueCount returns correct count of tasks with date < today and completed = 0', () => {
    const today = '2026-03-21'
    const yesterday = '2026-03-20'
    const dayBefore = '2026-03-19'

    // 2 overdue incomplete tasks
    db.prepare('INSERT INTO tasks (id, title, notes, date, completed, position, priority, created_at) VALUES (?, ?, NULL, ?, 0, 0, 0, ?)')
      .run('t1', 'Overdue 1', yesterday, '2026-03-20T08:00:00Z')
    db.prepare('INSERT INTO tasks (id, title, notes, date, completed, position, priority, created_at) VALUES (?, ?, NULL, ?, 0, 0, 0, ?)')
      .run('t2', 'Overdue 2', dayBefore, '2026-03-19T08:00:00Z')
    // 1 completed overdue (should NOT count)
    db.prepare('INSERT INTO tasks (id, title, notes, date, completed, position, priority, created_at) VALUES (?, ?, NULL, ?, 1, 0, 0, ?)')
      .run('t3', 'Done old', yesterday, '2026-03-20T08:00:00Z')
    // 1 today task (should NOT count as overdue)
    db.prepare('INSERT INTO tasks (id, title, notes, date, completed, position, priority, created_at) VALUES (?, ?, NULL, ?, 0, 0, 0, ?)')
      .run('t4', 'Today task', today, '2026-03-21T08:00:00Z')

    const result = getDashboardData(db, today)

    expect(result.tasks.overdueCount).toBe(2)
  })

  it('Test 3: empty state returns correct zero-value structure', () => {
    const date = '2026-03-21'

    const result = getDashboardData(db, date)

    expect(result).toEqual({
      habits: {
        total: 0,
        completed: 0,
        streakHighlights: [],
      },
      tasks: {
        todayIncomplete: [],
        totalIncomplete: 0,
        overdueCount: 0,
      },
      spending: {
        todayTotal: 0,
        topCategories: [],
      },
      food: {
        mealsToday: 0,
        mostEatenThisWeek: [],
        mostEatenThisMonth: [],
      },
    })
  })

  it('Test 4: spending aggregation groups by category and returns top 3 ordered by amount DESC', () => {
    const date = '2026-03-21'

    db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)').run('c1', 'Food', '#f97316')
    db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)').run('c2', 'Transport', '#3b82f6')
    db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)').run('c3', 'Bills', '#ef4444')
    db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)').run('c4', 'Other', '#6b7280')

    // c1: 30000, c2: 50000, c3: 10000, c4: 20000
    db.prepare('INSERT INTO expenses (id, amount, date, category_id, notes, created_at) VALUES (?, ?, ?, ?, NULL, ?)')
      .run('e1', 30000, date, 'c1', '2026-03-21T09:00:00Z')
    db.prepare('INSERT INTO expenses (id, amount, date, category_id, notes, created_at) VALUES (?, ?, ?, ?, NULL, ?)')
      .run('e2', 50000, date, 'c2', '2026-03-21T09:00:00Z')
    db.prepare('INSERT INTO expenses (id, amount, date, category_id, notes, created_at) VALUES (?, ?, ?, ?, NULL, ?)')
      .run('e3', 10000, date, 'c3', '2026-03-21T09:00:00Z')
    db.prepare('INSERT INTO expenses (id, amount, date, category_id, notes, created_at) VALUES (?, ?, ?, ?, NULL, ?)')
      .run('e4', 20000, date, 'c4', '2026-03-21T09:00:00Z')

    const result = getDashboardData(db, date)

    expect(result.spending.topCategories).toHaveLength(3)
    expect(result.spending.topCategories[0].name).toBe('Transport')
    expect(result.spending.topCategories[0].amount).toBe(50000)
    expect(result.spending.topCategories[1].name).toBe('Food')
    expect(result.spending.topCategories[1].amount).toBe(30000)
    expect(result.spending.topCategories[2].name).toBe('Other')
    expect(result.spending.topCategories[2].amount).toBe(20000)
    expect(result.spending.todayTotal).toBe(110000)
  })

  it('Test 5: habits filter by daysOfWeek bitmask for the given dates day-of-week', () => {
    // 2026-03-21 is Saturday (getDay() = 6), index 6 in daysOfWeek
    const saturday = '2026-03-21'

    // Only on Saturdays (index 6)
    db.prepare('INSERT INTO habits (id, name, days_of_week, archived, created_at, position) VALUES (?, ?, ?, 0, ?, 0)')
      .run('h1', 'Sat Habit', '0000001', '2026-01-01')
    // Only on Sundays (index 0)
    db.prepare('INSERT INTO habits (id, name, days_of_week, archived, created_at, position) VALUES (?, ?, ?, 0, ?, 0)')
      .run('h2', 'Sun Habit', '1000000', '2026-01-01')
    // Every day
    db.prepare('INSERT INTO habits (id, name, days_of_week, archived, created_at, position) VALUES (?, ?, ?, 0, ?, 0)')
      .run('h3', 'Daily Habit', '1111111', '2026-01-01')
    // Archived - should never count
    db.prepare('INSERT INTO habits (id, name, days_of_week, archived, created_at, position) VALUES (?, ?, ?, 1, ?, 0)')
      .run('h4', 'Archived', '1111111', '2026-01-01')

    const result = getDashboardData(db, saturday)

    // Only h1 (Sat) and h3 (Daily) should be counted = 2 total
    expect(result.habits.total).toBe(2)
    expect(result.habits.completed).toBe(0)
  })

  it('Test 6: count habit at partial value does not increment dashboard completed count', () => {
    const date = '2026-03-21'

    // boolean habit (completed)
    db.prepare('INSERT INTO habits (id, name, days_of_week, kind, target_count, archived, created_at, position) VALUES (?, ?, ?, ?, ?, 0, ?, 0)')
      .run('h1', 'Boolean Habit', '1111111', 'boolean', 1, '2026-01-01')
    db.prepare('INSERT INTO habit_completions (habit_id, date, value) VALUES (?, ?, ?)')
      .run('h1', date, 1)

    // count habit (partially completed, target = 8, value = 7)
    db.prepare('INSERT INTO habits (id, name, days_of_week, kind, target_count, archived, created_at, position) VALUES (?, ?, ?, ?, ?, 0, ?, 0)')
      .run('h2', 'Count Habit', '1111111', 'count', 8, '2026-01-01')
    db.prepare('INSERT INTO habit_completions (habit_id, date, value) VALUES (?, ?, ?)')
      .run('h2', date, 7)

    const result = getDashboardData(db, date)

    expect(result.habits.total).toBe(2)
    // Only the boolean habit is completely done
    expect(result.habits.completed).toBe(1)
  })

  it('Test 7: carried task still contributes to overdueCount after its date becomes today', () => {
    const today = '2026-03-21'
    const originalDate = '2026-03-19'

    // Task that was originally from the 19th and carried over to today
    db.prepare('INSERT INTO tasks (id, title, notes, date, completed, carried_from_date, position, priority, created_at) VALUES (?, ?, NULL, ?, 0, ?, 0, 0, ?)')
      .run('t1', 'Carried Task', today, originalDate, '2026-03-19T08:00:00Z')

    const result = getDashboardData(db, today)
    
    // Even though the task's current date IS today, because it was carried from the past, it should be counted as overdue
    expect(result.tasks.overdueCount).toBe(1)
  })
})
