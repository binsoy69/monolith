import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import type { Expense, Category } from '../../shared/domain-types'

interface ExpenseRow {
  id: string
  amount: number
  date: string
  categoryId: string
  walletId: string | null
  notes: string | null
  createdAt: string
}

const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#f97316' },
  { name: 'Transport', color: '#3b82f6' },
  { name: 'Bills', color: '#ef4444' },
  { name: 'Entertainment', color: '#a855f7' },
  { name: 'Shopping', color: '#ec4899' },
  { name: 'Health', color: '#22c55e' },
  { name: 'Other', color: '#6b7280' },
]

export class ExpenseRepository {
  constructor(private readonly db: Database.Database) {}

  list(filters?: { startDate?: string; endDate?: string; categoryId?: string }): Expense[] {
    const conditions: string[] = []
    const params: string[] = []

    if (filters?.startDate) {
      conditions.push('date >= ?')
      params.push(filters.startDate)
    }
    if (filters?.endDate) {
      conditions.push('date <= ?')
      params.push(filters.endDate)
    }
    if (filters?.categoryId) {
      conditions.push('category_id = ?')
      params.push(filters.categoryId)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const sql = `
      SELECT id, amount, date, category_id as categoryId, wallet_id as walletId, notes, created_at as createdAt
      FROM expenses
      ${where}
      ORDER BY date DESC, created_at DESC
    `
    const rows = this.db.prepare(sql).all(...params) as ExpenseRow[]
    return rows.map((r) => ({
      id: r.id,
      amount: r.amount,
      date: r.date,
      categoryId: r.categoryId,
      walletId: r.walletId,
      notes: r.notes,
      createdAt: r.createdAt,
    }))
  }

  create(data: {
    amount: number
    date: string
    categoryId: string
    walletId: string
    notes?: string
  }): string {
    const id = randomUUID()
    const now = new Date().toISOString()

    const tx = this.db.transaction(() => {
      this.db
        .prepare(
          'INSERT INTO expenses (id, amount, date, category_id, wallet_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
        .run(id, data.amount, data.date, data.categoryId, data.walletId, data.notes || null, now)
      this.db
        .prepare('UPDATE wallets SET balance = balance - ? WHERE id = ?')
        .run(data.amount, data.walletId)
    })
    tx()

    return id
  }

  update(
    id: string,
    data: {
      amount: number
      date: string
      categoryId: string
      walletId: string
      notes?: string
    }
  ): void {
    const tx = this.db.transaction(() => {
      // Read original expense to get old amount and walletId
      const original = this.db
        .prepare('SELECT amount, wallet_id FROM expenses WHERE id = ?')
        .get(id) as { amount: number; wallet_id: string } | undefined

      if (!original) return

      // Reverse old deduction
      this.db
        .prepare('UPDATE wallets SET balance = balance + ? WHERE id = ?')
        .run(original.amount, original.wallet_id)

      // Apply new deduction
      this.db
        .prepare('UPDATE wallets SET balance = balance - ? WHERE id = ?')
        .run(data.amount, data.walletId)

      // Update expense record
      this.db
        .prepare(
          'UPDATE expenses SET amount = ?, date = ?, category_id = ?, wallet_id = ?, notes = ? WHERE id = ?'
        )
        .run(data.amount, data.date, data.categoryId, data.walletId, data.notes || null, id)
    })
    tx()
  }

  delete(id: string): void {
    const tx = this.db.transaction(() => {
      // Read expense to get amount and walletId for reversal
      const expense = this.db
        .prepare('SELECT amount, wallet_id FROM expenses WHERE id = ?')
        .get(id) as { amount: number; wallet_id: string | null } | undefined

      if (!expense) return

      // Delete the expense
      this.db.prepare('DELETE FROM expenses WHERE id = ?').run(id)

      // Reverse deduction if wallet was set
      if (expense.wallet_id) {
        this.db
          .prepare('UPDATE wallets SET balance = balance + ? WHERE id = ?')
          .run(expense.amount, expense.wallet_id)
      }
    })
    tx()
  }

  listCategories(): Category[] {
    const rows = this.db
      .prepare('SELECT id, name, color FROM categories ORDER BY name ASC')
      .all() as Category[]
    return rows
  }

  createCategory(data: { name: string; color: string }): Category {
    const id = randomUUID()
    this.db
      .prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)')
      .run(id, data.name, data.color)
    return { id, name: data.name, color: data.color }
  }

  updateCategory(id: string, data: { name?: string; color?: string }): void {
    const fields: string[] = []
    const params: (string | undefined)[] = []

    if (data.name !== undefined) {
      fields.push('name = ?')
      params.push(data.name)
    }
    if (data.color !== undefined) {
      fields.push('color = ?')
      params.push(data.color)
    }

    if (fields.length === 0) return

    params.push(id)
    this.db.prepare(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`).run(...params)
  }

  deleteCategory(id: string): boolean {
    const row = this.db
      .prepare('SELECT COUNT(*) as n FROM expenses WHERE category_id = ?')
      .get(id) as { n: number }
    if (row.n > 0) return false
    this.db.prepare('DELETE FROM categories WHERE id = ?').run(id)
    return true
  }

  seedDefaultCategories(): void {
    const row = this.db
      .prepare('SELECT COUNT(*) as n FROM categories')
      .get() as { n: number }
    if (row.n > 0) return

    const insert = this.db.prepare(
      'INSERT INTO categories (id, name, color) VALUES (?, ?, ?)'
    )
    const insertMany = this.db.transaction(() => {
      for (const cat of DEFAULT_CATEGORIES) {
        insert.run(randomUUID(), cat.name, cat.color)
      }
    })
    insertMany()
  }
}
