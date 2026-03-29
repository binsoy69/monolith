import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import type { Expense, Category } from "../../shared/domain-types";
import type {
  ExpenseAnalytics,
  ExpenseCategoryBreakdownItem,
  ExpenseTrendPoint,
} from "../../shared/ipc-types";

interface ExpenseRow {
  id: string;
  amount: number;
  date: string;
  categoryId: string;
  walletId: string | null;
  notes: string | null;
  createdAt: string;
}

interface ExpenseCategoryBreakdownRow {
  categoryId: string;
  name: string;
  color: string | null;
  amount: number;
}

interface ExpenseTrendRow {
  month: string;
  total: number;
}

const DEFAULT_CATEGORIES = [
  { name: "Food", color: "#f97316" },
  { name: "Transport", color: "#3b82f6" },
  { name: "Bills", color: "#ef4444" },
  { name: "Entertainment", color: "#a855f7" },
  { name: "Shopping", color: "#ec4899" },
  { name: "Health", color: "#22c55e" },
  { name: "Other", color: "#6b7280" },
];

function parseMonthKey(month: string): Date {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) {
    throw new Error(`Invalid month key: ${month}`);
  }

  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
}

function shiftMonth(date: Date, delta: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1),
  );
}

function formatMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatIsoDate(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function getMonthStart(date: Date): string {
  return formatIsoDate(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)),
  );
}

function getMonthEnd(date: Date): string {
  return formatIsoDate(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)),
  );
}

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatShortMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export class ExpenseRepository {
  private readonly hasWalletTransactionsTable: boolean;

  constructor(private readonly db: Database.Database) {
    this.hasWalletTransactionsTable = this.hasTable("wallet_transactions");
  }

  private hasTable(tableName: string): boolean {
    const row = this.db
      .prepare(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1",
      )
      .get(tableName) as { 1: number } | undefined;
    return row !== undefined;
  }

  private recordWalletTransaction(data: {
    walletId: string;
    amount: number;
    type: "expense_deduction" | "expense_reversal";
    date: string;
    createdAt: string;
  }): void {
    if (!this.hasWalletTransactionsTable) {
      return;
    }

    this.db
      .prepare(
        "INSERT INTO wallet_transactions (id, wallet_id, amount, type, description, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        randomUUID(),
        data.walletId,
        data.amount,
        data.type,
        null,
        data.date,
        data.createdAt,
      );
  }

  list(filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  }): Expense[] {
    const conditions: string[] = [];
    const params: string[] = [];

    if (filters?.startDate) {
      conditions.push("date >= ?");
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      conditions.push("date <= ?");
      params.push(filters.endDate);
    }
    if (filters?.categoryId) {
      conditions.push("category_id = ?");
      params.push(filters.categoryId);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
      SELECT id, amount, date, category_id as categoryId, wallet_id as walletId, notes, created_at as createdAt
      FROM expenses
      ${where}
      ORDER BY date DESC, created_at DESC
    `;
    const rows = this.db.prepare(sql).all(...params) as ExpenseRow[];
    return rows.map((r) => ({
      id: r.id,
      amount: r.amount,
      date: r.date,
      categoryId: r.categoryId,
      walletId: r.walletId,
      notes: r.notes,
      createdAt: r.createdAt,
    }));
  }

  create(data: {
    amount: number;
    date: string;
    categoryId: string;
    walletId: string;
    notes?: string;
  }): string {
    const id = randomUUID();
    const now = new Date().toISOString();

    const tx = this.db.transaction(() => {
      this.db
        .prepare(
          "INSERT INTO expenses (id, amount, date, category_id, wallet_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .run(
          id,
          data.amount,
          data.date,
          data.categoryId,
          data.walletId,
          data.notes || null,
          now,
        );
      this.db
        .prepare("UPDATE wallets SET balance = balance - ? WHERE id = ?")
        .run(data.amount, data.walletId);
      this.recordWalletTransaction({
        walletId: data.walletId,
        amount: -data.amount,
        type: "expense_deduction",
        date: data.date,
        createdAt: now,
      });
    });
    tx();

    return id;
  }

  update(
    id: string,
    data: {
      amount: number;
      date: string;
      categoryId: string;
      walletId: string;
      notes?: string;
    },
  ): void {
    const tx = this.db.transaction(() => {
      const now = new Date().toISOString();

      // Read original expense to get old amount and walletId
      const original = this.db
        .prepare("SELECT amount, wallet_id FROM expenses WHERE id = ?")
        .get(id) as { amount: number; wallet_id: string } | undefined;

      if (!original) return;

      // Reverse old deduction
      this.db
        .prepare("UPDATE wallets SET balance = balance + ? WHERE id = ?")
        .run(original.amount, original.wallet_id);
      this.recordWalletTransaction({
        walletId: original.wallet_id,
        amount: original.amount,
        type: "expense_reversal",
        date: data.date,
        createdAt: now,
      });

      // Apply new deduction
      this.db
        .prepare("UPDATE wallets SET balance = balance - ? WHERE id = ?")
        .run(data.amount, data.walletId);
      this.recordWalletTransaction({
        walletId: data.walletId,
        amount: -data.amount,
        type: "expense_deduction",
        date: data.date,
        createdAt: now,
      });

      // Update expense record
      this.db
        .prepare(
          "UPDATE expenses SET amount = ?, date = ?, category_id = ?, wallet_id = ?, notes = ? WHERE id = ?",
        )
        .run(
          data.amount,
          data.date,
          data.categoryId,
          data.walletId,
          data.notes || null,
          id,
        );
    });
    tx();
  }

  delete(id: string): void {
    const tx = this.db.transaction(() => {
      // Read expense to get amount and walletId for reversal
      const expense = this.db
        .prepare("SELECT amount, wallet_id, date FROM expenses WHERE id = ?")
        .get(id) as
        | { amount: number; wallet_id: string | null; date: string }
        | undefined;

      if (!expense) return;

      // Delete the expense
      this.db.prepare("DELETE FROM expenses WHERE id = ?").run(id);

      // Reverse deduction if wallet was set
      if (expense.wallet_id) {
        this.db
          .prepare("UPDATE wallets SET balance = balance + ? WHERE id = ?")
          .run(expense.amount, expense.wallet_id);
        const now = new Date().toISOString();
        this.recordWalletTransaction({
          walletId: expense.wallet_id,
          amount: expense.amount,
          type: "expense_reversal",
          date: expense.date,
          createdAt: now,
        });
      }
    });
    tx();
  }

  listCategories(): Category[] {
    const rows = this.db
      .prepare("SELECT id, name, color FROM categories ORDER BY name ASC")
      .all() as Category[];
    return rows;
  }

  createCategory(data: { name: string; color: string }): Category {
    const id = randomUUID();
    this.db
      .prepare("INSERT INTO categories (id, name, color) VALUES (?, ?, ?)")
      .run(id, data.name, data.color);
    return { id, name: data.name, color: data.color };
  }

  updateCategory(id: string, data: { name?: string; color?: string }): void {
    const fields: string[] = [];
    const params: (string | undefined)[] = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      params.push(data.name);
    }
    if (data.color !== undefined) {
      fields.push("color = ?");
      params.push(data.color);
    }

    if (fields.length === 0) return;

    params.push(id);
    this.db
      .prepare(`UPDATE categories SET ${fields.join(", ")} WHERE id = ?`)
      .run(...params);
  }

  deleteCategory(id: string): boolean {
    const row = this.db
      .prepare("SELECT COUNT(*) as n FROM expenses WHERE category_id = ?")
      .get(id) as { n: number };
    if (row.n > 0) return false;
    this.db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    return true;
  }

  seedDefaultCategories(): void {
    const row = this.db
      .prepare("SELECT COUNT(*) as n FROM categories")
      .get() as { n: number };
    if (row.n > 0) return;

    const insert = this.db.prepare(
      "INSERT INTO categories (id, name, color) VALUES (?, ?, ?)",
    );
    const insertMany = this.db.transaction(() => {
      for (const cat of DEFAULT_CATEGORIES) {
        insert.run(randomUUID(), cat.name, cat.color);
      }
    });
    insertMany();
  }

  getAnalytics(data: {
    month: string;
    trendMonths: 3 | 6 | 12;
  }): ExpenseAnalytics {
    const selectedMonth = parseMonthKey(data.month);
    const monthStart = getMonthStart(selectedMonth);
    const monthEnd = getMonthEnd(selectedMonth);

    const monthTotalRow = this.db
      .prepare(
        "SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE date >= ? AND date <= ?",
      )
      .get(monthStart, monthEnd) as { total: number };

    const monthTotal = monthTotalRow.total;

    const categoryBreakdownRows = this.db
      .prepare(
        `
          SELECT
            c.id AS categoryId,
            c.name AS name,
            c.color AS color,
            SUM(e.amount) AS amount
          FROM expenses e
          JOIN categories c ON e.category_id = c.id
          WHERE e.date >= ? AND e.date <= ?
          GROUP BY c.id, c.name, c.color
          ORDER BY amount DESC, c.name ASC
        `,
      )
      .all(monthStart, monthEnd) as ExpenseCategoryBreakdownRow[];

    const categoryBreakdown: ExpenseCategoryBreakdownItem[] =
      categoryBreakdownRows.map((row) => ({
        categoryId: row.categoryId,
        name: row.name,
        color: row.color,
        amount: row.amount,
        percentage: monthTotal === 0 ? 0 : row.amount / monthTotal,
      }));

    const trendStartMonth = shiftMonth(selectedMonth, -(data.trendMonths - 1));
    const trendRows = this.db
      .prepare(
        `
          SELECT substr(date, 1, 7) AS month, SUM(amount) AS total
          FROM expenses
          WHERE date >= ? AND date <= ?
          GROUP BY substr(date, 1, 7)
          ORDER BY month ASC
        `,
      )
      .all(getMonthStart(trendStartMonth), monthEnd) as ExpenseTrendRow[];

    const trendTotals = new Map(trendRows.map((row) => [row.month, row.total]));
    const trend: ExpenseTrendPoint[] = [];

    for (let index = 0; index < data.trendMonths; index += 1) {
      const monthDate = shiftMonth(trendStartMonth, index);
      const monthKey = formatMonthKey(monthDate);
      trend.push({
        month: monthKey,
        label: formatShortMonthLabel(monthDate),
        total: trendTotals.get(monthKey) ?? 0,
      });
    }

    return {
      month: data.month,
      monthLabel: formatMonthLabel(selectedMonth),
      monthTotal,
      categoryBreakdown,
      trend,
    };
  }
}
