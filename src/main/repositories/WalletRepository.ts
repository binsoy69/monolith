import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import type { Wallet } from '../../shared/domain-types'

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

  update(id: string, data: { name?: string }): void {
    if (data.name !== undefined) {
      this.db.prepare('UPDATE wallets SET name = ? WHERE id = ?').run(data.name, id)
    }
  }

  adjustBalance(id: string, mode: 'set' | 'delta', amount: number): void {
    if (mode === 'set') {
      this.db.prepare('UPDATE wallets SET balance = ? WHERE id = ?').run(amount, id)
    } else {
      this.db.prepare('UPDATE wallets SET balance = balance + ? WHERE id = ?').run(amount, id)
    }
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
