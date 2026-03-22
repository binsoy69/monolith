// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { ExpenseRepository } from '../src/main/repositories/ExpenseRepository'

function createTestDb(): Database.Database {
  const db = new Database(':memory:')
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(`
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
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (wallet_id) REFERENCES wallets(id)
    );
  `)
  return db
}

describe('ExpenseRepository analytics', () => {
  let db: Database.Database
  let repo: ExpenseRepository

  beforeEach(() => {
    db = createTestDb()
    repo = new ExpenseRepository(db)

    db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)').run(
      'cat-food',
      'Food',
      '#f97316'
    )
    db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)').run(
      'cat-transport',
      'Transport',
      '#3b82f6'
    )
    db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)').run(
      'cat-entertainment',
      'Entertainment',
      '#a855f7'
    )
  })

  it('returns the current-month total in cents', () => {
    db.prepare(
      'INSERT INTO expenses (id, amount, date, category_id, wallet_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run('expense-1', 10050, '2026-03-01', 'cat-food', null, null, '2026-03-01T00:00:00Z')
    db.prepare(
      'INSERT INTO expenses (id, amount, date, category_id, wallet_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      'expense-2',
      20050,
      '2026-03-15',
      'cat-transport',
      null,
      null,
      '2026-03-15T00:00:00Z'
    )
    db.prepare(
      'INSERT INTO expenses (id, amount, date, category_id, wallet_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      'expense-3',
      50000,
      '2026-02-15',
      'cat-entertainment',
      null,
      null,
      '2026-02-15T00:00:00Z'
    )

    const analytics = repo.getAnalytics({ month: '2026-03', trendMonths: 3 })

    expect(analytics.month).toBe('2026-03')
    expect(analytics.monthLabel).toBe('March 2026')
    expect(analytics.monthTotal).toBe(30100)
  })

  it('sorts category breakdown descending and calculates percentages from the month total', () => {
    db.prepare(
      'INSERT INTO expenses (id, amount, date, category_id, wallet_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run('expense-1', 10000, '2026-03-01', 'cat-food', null, null, '2026-03-01T00:00:00Z')
    db.prepare(
      'INSERT INTO expenses (id, amount, date, category_id, wallet_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      'expense-2',
      40000,
      '2026-03-10',
      'cat-transport',
      null,
      null,
      '2026-03-10T00:00:00Z'
    )
    db.prepare(
      'INSERT INTO expenses (id, amount, date, category_id, wallet_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      'expense-3',
      50000,
      '2026-03-20',
      'cat-entertainment',
      null,
      null,
      '2026-03-20T00:00:00Z'
    )

    const analytics = repo.getAnalytics({ month: '2026-03', trendMonths: 3 })

    expect(analytics.categoryBreakdown).toEqual([
      {
        categoryId: 'cat-entertainment',
        name: 'Entertainment',
        color: '#a855f7',
        amount: 50000,
        percentage: 0.5,
      },
      {
        categoryId: 'cat-transport',
        name: 'Transport',
        color: '#3b82f6',
        amount: 40000,
        percentage: 0.4,
      },
      {
        categoryId: 'cat-food',
        name: 'Food',
        color: '#f97316',
        amount: 10000,
        percentage: 0.1,
      },
    ])
  })

  it('returns exactly 3 trend rows with zero-filled months', () => {
    db.prepare(
      'INSERT INTO expenses (id, amount, date, category_id, wallet_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run('expense-1', 2000, '2026-01-15', 'cat-food', null, null, '2026-01-15T00:00:00Z')
    db.prepare(
      'INSERT INTO expenses (id, amount, date, category_id, wallet_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run('expense-2', 1000, '2026-03-05', 'cat-food', null, null, '2026-03-05T00:00:00Z')

    const analytics = repo.getAnalytics({ month: '2026-03', trendMonths: 3 })

    expect(analytics.trend).toEqual([
      { month: '2026-01', label: 'Jan', total: 2000 },
      { month: '2026-02', label: 'Feb', total: 0 },
      { month: '2026-03', label: 'Mar', total: 1000 },
    ])
  })

  it('returns exactly 6 trend rows with zero-filled months', () => {
    const analytics = repo.getAnalytics({ month: '2026-03', trendMonths: 6 })

    expect(analytics.trend).toHaveLength(6)
    expect(analytics.trend.map((point) => point.month)).toEqual([
      '2025-10',
      '2025-11',
      '2025-12',
      '2026-01',
      '2026-02',
      '2026-03',
    ])
    expect(analytics.trend.every((point) => point.total === 0)).toBe(true)
  })

  it('returns exactly 12 trend rows when requested', () => {
    const analytics = repo.getAnalytics({ month: '2026-03', trendMonths: 12 })

    expect(analytics.trend).toHaveLength(12)
    expect(analytics.trend[0]?.month).toBe('2025-04')
    expect(analytics.trend[11]?.month).toBe('2026-03')
  })
})
