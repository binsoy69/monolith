import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";
import * as schema from "@/lib/db/schema";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";

type FinanceService = typeof import("@/lib/services/finance.service").financeService;

// Setup Test DB
const sqlite = new Database(":memory:");
const testDb = drizzle(sqlite, { schema });
let financeService!: FinanceService;

// Apply migrations
beforeAll(async () => {
  const migrationsFolder = path.join(process.cwd(), "src/lib/db/migrations");
  migrate(testDb, { migrationsFolder });

  (globalThis as typeof globalThis & { __monolithDb?: typeof testDb }).__monolithDb = testDb;
  vi.resetModules();
  ({ financeService } = await import("@/lib/services/finance.service"));
});

afterAll(() => {
  delete (globalThis as typeof globalThis & { __monolithDb?: unknown }).__monolithDb;
  sqlite.close();
});

describe("Finance Integration", () => {
  beforeEach(async () => {
    // Clear tables
    await testDb.delete(schema.transactions);
    await testDb.delete(schema.financeAccounts);
    await testDb.delete(schema.financeCategories);
    await testDb.delete(schema.budgets);
    await testDb.delete(schema.savingsGoals);
  });

  it("should create account and log transaction", async () => {
    const account = await financeService.createAccount({
      name: "Wallet",
      balance: 1000,
    });
    const category = await financeService.createCategory({
      name: "Food",
      type: "expense",
      color: "blue",
    });

    const txn = await financeService.createTransaction({
      accountId: account.id,
      categoryId: category.id,
      amount: 50,
      type: "expense",
      transactionDate: new Date().toISOString().split("T")[0],
    });

    expect(txn).toBeDefined();
    expect(txn.amount).toBe(50);

    // Check balance update
    const updatedAccount = (await financeService.getAccounts()).find(
      (a) => a.id === account.id,
    );
    expect(updatedAccount?.balance).toBe(950);
  });

  it("should calculate monthly summary correctly", async () => {
    const account = await financeService.createAccount({
      name: "Bank",
      balance: 5000,
    });
    const expenseCat = await financeService.createCategory({
      name: "Rent",
      type: "expense",
      color: "red",
    });
    const incomeCat = await financeService.createCategory({
      name: "Salary",
      type: "income",
      color: "green",
    });

    // Income: 2000
    await financeService.createTransaction({
      accountId: account.id,
      categoryId: incomeCat.id,
      amount: 2000,
      type: "income",
      transactionDate: "2023-01-15",
    });

    // Expense: 1000
    await financeService.createTransaction({
      accountId: account.id,
      categoryId: expenseCat.id,
      amount: 1000,
      type: "expense",
      transactionDate: "2023-01-20",
    });

    const summary = await financeService.getMonthlySummary(2023, 1);
    expect(summary.totalIncome).toBe(2000);
    expect(summary.totalExpense).toBe(1000);
    expect(summary.net).toBe(1000);
  });
});
