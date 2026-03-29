import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import type { Wallet, WalletTransaction } from '../../shared/domain-types'

export class WalletRepository {
  constructor(private readonly db: Database.Database) {}

  list(): Wallet[] {
    const rows = this.db
      .prepare('SELECT id, name, balance FROM wallets ORDER BY name ASC')
      .all() as Wallet[]
    return rows
  }

  create(data: { name: string; balance: number }): Wallet {
    const id = randomUUID()
    this.db
      .prepare('INSERT INTO wallets (id, name, balance) VALUES (?, ?, ?)')
      .run(id, data.name, data.balance)
    return { id, name: data.name, balance: data.balance }
  }

  update(id: string, data: { name?: string; balance?: number; description?: string }): void {
    const tx = this.db.transaction(() => {
      if (data.name !== undefined) {
        this.db.prepare('UPDATE wallets SET name = ? WHERE id = ?').run(data.name, id)
      }
      if (data.balance !== undefined) {
        this.db.prepare('UPDATE wallets SET balance = ? WHERE id = ?').run(data.balance, id)
        const now = new Date().toISOString()
        const today = now.slice(0, 10)
        this.db
          .prepare(
            'INSERT INTO wallet_transactions (id, wallet_id, amount, type, description, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
          )
          .run(randomUUID(), id, data.balance, 'manual_set', data.description ?? null, today, now)
      }
    })
    tx()
  }

  adjustBalance(id: string, mode: 'set' | 'delta', amount: number, description?: string): void {
    const now = new Date().toISOString()
    const today = now.slice(0, 10)
    const type = mode === 'set' ? 'manual_set' : 'manual_delta'

    const tx = this.db.transaction(() => {
      if (mode === 'set') {
        this.db.prepare('UPDATE wallets SET balance = ? WHERE id = ?').run(amount, id)
      } else {
        this.db.prepare('UPDATE wallets SET balance = balance + ? WHERE id = ?').run(amount, id)
      }
      this.db
        .prepare(
          'INSERT INTO wallet_transactions (id, wallet_id, amount, type, description, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
        .run(randomUUID(), id, amount, type, description ?? null, today, now)
    })
    tx()
  }

  listTransactions(walletId: string): WalletTransaction[] {
    const rows = this.db
      .prepare(
        `SELECT id, wallet_id as walletId, amount, type, description, date, created_at as createdAt
         FROM wallet_transactions
         WHERE wallet_id = ?
         ORDER BY created_at DESC`
      )
      .all(walletId) as WalletTransaction[]
    return rows
  }

  delete(id: string): boolean {
    const row = this.db
      .prepare('SELECT COUNT(*) as n FROM expenses WHERE wallet_id = ?')
      .get(id) as { n: number }
    if (row.n > 0) return false
    this.db.prepare('DELETE FROM wallets WHERE id = ?').run(id)
    return true
  }

  getTotalBalance(): number {
    const row = this.db
      .prepare('SELECT COALESCE(SUM(balance), 0) as total FROM wallets')
      .get() as { total: number }
    return row.total
  }
}
