import { describe, it, expect, beforeEach, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";
import { formatCurrency, toCents, fromCents } from "@/lib/utils/currency";

const sqlite = new Database(":memory:");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS finance_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT,
    is_default INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );
  CREATE TABLE IF NOT EXISTS finance_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    balance INTEGER NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'PHP' NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES finance_categories(id),
    account_id INTEGER NOT NULL REFERENCES finance_accounts(id),
    to_account_id INTEGER REFERENCES finance_accounts(id),
    is_recurring INTEGER DEFAULT 0,
    recurrence TEXT,
    transaction_date TEXT NOT NULL,
    tags TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );
  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES finance_categories(id),
    amount INTEGER NOT NULL,
    period TEXT DEFAULT 'monthly',
    start_date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );
  CREATE TABLE IF NOT EXISTS savings_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    target INTEGER NOT NULL,
    current INTEGER DEFAULT 0,
    deadline TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );
`);

const testDb = drizzle(sqlite, { schema });

vi.mock("@/lib/db", () => ({
  db: testDb,
  getDb: () => testDb,
}));

const { financeService } = await import("../finance.service");

describe("financeService", () => {
  beforeEach(() => {
    sqlite.exec("DELETE FROM transactions");
    sqlite.exec("DELETE FROM budgets");
    sqlite.exec("DELETE FROM savings_goals");
    sqlite.exec("DELETE FROM finance_accounts");
    sqlite.exec("DELETE FROM finance_categories");
  });

  describe("accounts", () => {
    it("should create an account with default balance", async () => {
      const account = await financeService.createAccount({ name: "Cash" });
      expect(account.name).toBe("Cash");
      expect(account.balance).toBe(0);
      expect(account.currency).toBe("PHP");
    });
  });

  describe("transactions and balance", () => {
    it("should increase balance on income", async () => {
      const account = await financeService.createAccount({ name: "Bank" });
      await financeService.createTransaction({
        type: "income",
        amount: 100000, // ₱1,000.00
        accountId: account.id,
        transactionDate: "2026-02-11",
      });

      const accounts = await financeService.getAccounts();
      expect(accounts[0].balance).toBe(100000);
    });

    it("should decrease balance on expense", async () => {
      const account = await financeService.createAccount({ name: "Bank", balance: 200000 });
      await financeService.createTransaction({
        type: "expense",
        amount: 50000,
        accountId: account.id,
        transactionDate: "2026-02-11",
      });

      const accounts = await financeService.getAccounts();
      expect(accounts[0].balance).toBe(150000);
    });

    it("should handle transfer between accounts", async () => {
      const checking = await financeService.createAccount({ name: "Checking", balance: 100000 });
      const savings = await financeService.createAccount({ name: "Savings", balance: 0 });

      await financeService.createTransaction({
        type: "transfer",
        amount: 30000,
        accountId: checking.id,
        toAccountId: savings.id,
        transactionDate: "2026-02-11",
      });

      const accounts = await financeService.getAccounts();
      const checkAcc = accounts.find((a) => a.id === checking.id)!;
      const saveAcc = accounts.find((a) => a.id === savings.id)!;
      expect(checkAcc.balance).toBe(70000);
      expect(saveAcc.balance).toBe(30000);
    });

    it("should reverse balance on delete", async () => {
      const account = await financeService.createAccount({ name: "Bank", balance: 100000 });
      const txn = await financeService.createTransaction({
        type: "expense",
        amount: 25000,
        accountId: account.id,
        transactionDate: "2026-02-11",
      });

      await financeService.deleteTransaction(txn.id);
      const accounts = await financeService.getAccounts();
      expect(accounts[0].balance).toBe(100000);
    });
  });

  describe("monthly summary", () => {
    it("should calculate totals by category", async () => {
      const account = await financeService.createAccount({ name: "Bank" });
      const foodCat = await financeService.createCategory({ name: "Food", type: "expense", color: "#ef4444" });
      const salaryCat = await financeService.createCategory({ name: "Salary", type: "income", color: "#10b981" });

      await financeService.createTransaction({
        type: "income",
        amount: 4500000,
        categoryId: salaryCat.id,
        accountId: account.id,
        transactionDate: "2026-02-05",
      });
      await financeService.createTransaction({
        type: "expense",
        amount: 85000,
        categoryId: foodCat.id,
        accountId: account.id,
        transactionDate: "2026-02-10",
      });

      const summary = await financeService.getMonthlySummary(2026, 2);
      expect(summary.totalIncome).toBe(4500000);
      expect(summary.totalExpense).toBe(85000);
      expect(summary.net).toBe(4500000 - 85000);
      expect(summary.byCategory.length).toBe(1);
      expect(summary.byCategory[0].name).toBe("Food");
    });
  });

  describe("currency formatting", () => {
    it("should format PHP correctly", () => {
      expect(formatCurrency(123456)).toBe("₱1,234.56");
      expect(formatCurrency(0)).toBe("₱0.00");
      expect(formatCurrency(100)).toBe("₱1.00");
    });

    it("should format negative amounts", () => {
      expect(formatCurrency(-50000)).toBe("₱-500.00");
    });

    it("should convert between cents and amounts", () => {
      expect(toCents(1234.56)).toBe(123456);
      expect(fromCents(123456)).toBe(1234.56);
    });
  });
});
