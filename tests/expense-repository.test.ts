// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest'
import Database from 'better-sqlite3'
import { ExpenseRepository } from '../src/main/repositories/ExpenseRepository'
import { WalletRepository } from '../src/main/repositories/WalletRepository'

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

describe('ExpenseRepository and WalletRepository', () => {
  let db: Database.Database
  let expenseRepo: ExpenseRepository
  let walletRepo: WalletRepository

  beforeEach(() => {
    db = createTestDb()
    expenseRepo = new ExpenseRepository(db)
    walletRepo = new WalletRepository(db)

    // Seed a category for tests
    db.prepare(
      'INSERT INTO categories (id, name, color) VALUES (?, ?, ?)'
    ).run('cat-1', 'Food', '#f97316')
  })

  describe('WalletRepository', () => {
    it('creates a wallet and lists it', () => {
      const wallet = walletRepo.create({ name: 'Cash', balance: 500000 }) // ₱5,000.00
      const wallets = walletRepo.list()
      expect(wallets).toHaveLength(1)
      expect(wallets[0].id).toBe(wallet.id)
      expect(wallets[0].name).toBe('Cash')
      expect(wallets[0].balance).toBe(500000)
    })

    it('getTotalBalance sums all wallet balances', () => {
      walletRepo.create({ name: 'Cash', balance: 300000 })
      walletRepo.create({ name: 'Bank', balance: 100000 })
      expect(walletRepo.getTotalBalance()).toBe(400000)
    })

    it('adjustBalance with set mode sets balance directly', () => {
      const wallet = walletRepo.create({ name: 'Cash', balance: 100000 })
      walletRepo.adjustBalance(wallet.id, 'set', 250000)
      const updated = walletRepo.list().find((w) => w.id === wallet.id)
      expect(updated!.balance).toBe(250000)
    })

    it('adjustBalance with delta mode adds to existing balance', () => {
      const wallet = walletRepo.create({ name: 'Cash', balance: 100000 })
      walletRepo.adjustBalance(wallet.id, 'delta', 50000)
      const updated = walletRepo.list().find((w) => w.id === wallet.id)
      expect(updated!.balance).toBe(150000)
    })

    it('adjustBalance with negative delta subtracts from balance', () => {
      const wallet = walletRepo.create({ name: 'Cash', balance: 100000 })
      walletRepo.adjustBalance(wallet.id, 'delta', -30000)
      const updated = walletRepo.list().find((w) => w.id === wallet.id)
      expect(updated!.balance).toBe(70000)
    })

    it('deleteWallet returns false when wallet has expenses', () => {
      const wallet = walletRepo.create({ name: 'Cash', balance: 100000 })
      expenseRepo.create({
        amount: 1500,
        date: '2026-03-20',
        categoryId: 'cat-1',
        walletId: wallet.id,
      })
      const result = walletRepo.delete(wallet.id)
      expect(result).toBe(false)
      // Wallet should still exist
      expect(walletRepo.list()).toHaveLength(1)
    })

    it('deleteWallet returns true and deletes when wallet has no expenses', () => {
      const wallet = walletRepo.create({ name: 'Cash', balance: 100000 })
      const result = walletRepo.delete(wallet.id)
      expect(result).toBe(true)
      expect(walletRepo.list()).toHaveLength(0)
    })
  })

  describe('ExpenseRepository - atomic wallet deduction', () => {
    it('createExpense deducts amount from wallet balance atomically', () => {
      const wallet = walletRepo.create({ name: 'Cash', balance: 100000 }) // ₱1,000.00
      expenseRepo.create({
        amount: 15000, // ₱150.00
        date: '2026-03-20',
        categoryId: 'cat-1',
        walletId: wallet.id,
      })
      const updated = walletRepo.list().find((w) => w.id === wallet.id)
      expect(updated!.balance).toBe(85000) // 100000 - 15000
    })

    it('deleteExpense reverses wallet deduction (balance restored)', () => {
      const wallet = walletRepo.create({ name: 'Cash', balance: 100000 })
      const expenseId = expenseRepo.create({
        amount: 15000,
        date: '2026-03-20',
        categoryId: 'cat-1',
        walletId: wallet.id,
      })
      expenseRepo.delete(expenseId)
      const restored = walletRepo.list().find((w) => w.id === wallet.id)
      expect(restored!.balance).toBe(100000) // back to original
    })

    it('editExpense reverses old deduction and applies new one correctly', () => {
      const wallet = walletRepo.create({ name: 'Cash', balance: 100000 })
      const expenseId = expenseRepo.create({
        amount: 15000, // deducts 15000 -> balance = 85000
        date: '2026-03-20',
        categoryId: 'cat-1',
        walletId: wallet.id,
      })
      expenseRepo.update(expenseId, {
        amount: 20000, // new amount — deduct 20000 instead
        date: '2026-03-20',
        categoryId: 'cat-1',
        walletId: wallet.id,
      })
      // Should: reverse 15000 (balance -> 100000) then deduct 20000 (balance -> 80000)
      const updated = walletRepo.list().find((w) => w.id === wallet.id)
      expect(updated!.balance).toBe(80000)
    })

    it('editExpense with different wallet moves deduction between wallets', () => {
      const walletA = walletRepo.create({ name: 'Cash', balance: 100000 })
      const walletB = walletRepo.create({ name: 'Bank', balance: 200000 })
      const expenseId = expenseRepo.create({
        amount: 15000,
        date: '2026-03-20',
        categoryId: 'cat-1',
        walletId: walletA.id,
      })
      // walletA: 100000 - 15000 = 85000
      expenseRepo.update(expenseId, {
        amount: 25000,
        date: '2026-03-20',
        categoryId: 'cat-1',
        walletId: walletB.id,
      })
      // walletA: should be restored to 100000 (old deduction reversed)
      // walletB: 200000 - 25000 = 175000
      const updatedA = walletRepo.list().find((w) => w.id === walletA.id)
      const updatedB = walletRepo.list().find((w) => w.id === walletB.id)
      expect(updatedA!.balance).toBe(100000)
      expect(updatedB!.balance).toBe(175000)
    })

    it('createExpense with wallet balance going negative is allowed (no constraint)', () => {
      const wallet = walletRepo.create({ name: 'Cash', balance: 5000 }) // ₱50.00
      // Create expense larger than balance
      expect(() =>
        expenseRepo.create({
          amount: 10000, // ₱100.00 — more than balance
          date: '2026-03-20',
          categoryId: 'cat-1',
          walletId: wallet.id,
        })
      ).not.toThrow()
      const updated = walletRepo.list().find((w) => w.id === wallet.id)
      expect(updated!.balance).toBe(-5000) // negative is allowed
    })
  })

  describe('ExpenseRepository - category operations', () => {
    it('deleteCategory returns false when category has expenses', () => {
      const wallet = walletRepo.create({ name: 'Cash', balance: 100000 })
      expenseRepo.create({
        amount: 1500,
        date: '2026-03-20',
        categoryId: 'cat-1',
        walletId: wallet.id,
      })
      const result = expenseRepo.deleteCategory('cat-1')
      expect(result).toBe(false)
    })

    it('deleteCategory returns true when category has no expenses', () => {
      db.prepare('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)').run(
        'cat-2',
        'Transport',
        '#3b82f6'
      )
      const result = expenseRepo.deleteCategory('cat-2')
      expect(result).toBe(true)
    })

    it('seedDefaultCategories inserts 7 categories when table is empty', () => {
      // Clear the seeded category first
      db.prepare('DELETE FROM categories').run()
      expenseRepo.seedDefaultCategories()
      const categories = expenseRepo.listCategories()
      expect(categories).toHaveLength(7)
    })

    it('seedDefaultCategories does not insert when categories already exist', () => {
      // cat-1 already in db from beforeEach
      expenseRepo.seedDefaultCategories()
      const categories = expenseRepo.listCategories()
      expect(categories).toHaveLength(1) // still just cat-1
    })
  })
})
