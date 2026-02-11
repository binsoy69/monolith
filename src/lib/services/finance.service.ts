import { db } from "@/lib/db";
import {
  transactions,
  financeCategories,
  financeAccounts,
  budgets,
  savingsGoals,
} from "@/lib/db/schema";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { toISODate, startOfMonth, endOfMonth } from "@/lib/utils/dates";

// --- Types ---

export type Transaction = typeof transactions.$inferSelect;
export type FinanceCategory = typeof financeCategories.$inferSelect;
export type FinanceAccount = typeof financeAccounts.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type SavingsGoal = typeof savingsGoals.$inferSelect;

export interface BudgetWithSpent extends Budget {
  categoryName: string;
  categoryColor: string;
  spent: number;
}

export interface CreateTransactionInput {
  type: "income" | "expense" | "transfer";
  amount: number; // in cents
  description?: string;
  categoryId?: number | null;
  accountId: number;
  toAccountId?: number | null;
  transactionDate: string;
  isRecurring?: boolean;
  recurrence?: Record<string, unknown> | null;
  tags?: string[] | null;
}

// --- Service ---

export const financeService = {
  // === Transactions ===

  async getTransactions(opts?: {
    page?: number;
    limit?: number;
    type?: "income" | "expense" | "transfer";
    categoryId?: number;
    accountId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ transactions: Transaction[]; total: number }> {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (opts?.type) conditions.push(eq(transactions.type, opts.type));
    if (opts?.categoryId) conditions.push(eq(transactions.categoryId, opts.categoryId));
    if (opts?.accountId) conditions.push(eq(transactions.accountId, opts.accountId));
    if (opts?.startDate) conditions.push(gte(transactions.transactionDate, opts.startDate));
    if (opts?.endDate) conditions.push(lte(transactions.transactionDate, opts.endDate));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(where);

    const txns = await db
      .select()
      .from(transactions)
      .where(where)
      .orderBy(desc(transactions.transactionDate), desc(transactions.id))
      .limit(limit)
      .offset(offset);

    return { transactions: txns, total: totalResult[0]?.count ?? 0 };
  },

  async getTransaction(id: number): Promise<Transaction | null> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  async createTransaction(data: CreateTransactionInput): Promise<Transaction> {
    const result = await db
      .insert(transactions)
      .values({
        type: data.type,
        amount: data.amount,
        description: data.description,
        categoryId: data.categoryId,
        accountId: data.accountId,
        toAccountId: data.toAccountId,
        transactionDate: data.transactionDate,
        isRecurring: data.isRecurring,
        recurrence: data.recurrence,
        tags: data.tags,
      })
      .returning();

    const txn = result[0];

    // Update account balances
    await this.applyBalanceChange(txn, 1);

    return txn;
  },

  async updateTransaction(
    id: number,
    data: Partial<CreateTransactionInput>,
  ): Promise<void> {
    // Reverse old balance
    const old = await this.getTransaction(id);
    if (old) await this.applyBalanceChange(old, -1);

    await db
      .update(transactions)
      .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(transactions.id, id));

    // Apply new balance
    const updated = await this.getTransaction(id);
    if (updated) await this.applyBalanceChange(updated, 1);
  },

  async deleteTransaction(id: number): Promise<void> {
    const txn = await this.getTransaction(id);
    if (txn) {
      await this.applyBalanceChange(txn, -1);
      await db.delete(transactions).where(eq(transactions.id, id));
    }
  },

  async applyBalanceChange(txn: Transaction, direction: 1 | -1): Promise<void> {
    const delta = txn.amount * direction;
    if (txn.type === "income") {
      await db
        .update(financeAccounts)
        .set({ balance: sql`${financeAccounts.balance} + ${delta}` })
        .where(eq(financeAccounts.id, txn.accountId));
    } else if (txn.type === "expense") {
      await db
        .update(financeAccounts)
        .set({ balance: sql`${financeAccounts.balance} - ${delta}` })
        .where(eq(financeAccounts.id, txn.accountId));
    } else if (txn.type === "transfer") {
      await db
        .update(financeAccounts)
        .set({ balance: sql`${financeAccounts.balance} - ${delta}` })
        .where(eq(financeAccounts.id, txn.accountId));
      if (txn.toAccountId) {
        await db
          .update(financeAccounts)
          .set({ balance: sql`${financeAccounts.balance} + ${delta}` })
          .where(eq(financeAccounts.id, txn.toAccountId));
      }
    }
  },

  // === Categories ===

  async getCategories(
    type?: "income" | "expense",
  ): Promise<FinanceCategory[]> {
    if (type) {
      return db
        .select()
        .from(financeCategories)
        .where(eq(financeCategories.type, type))
        .orderBy(asc(financeCategories.name));
    }
    return db
      .select()
      .from(financeCategories)
      .orderBy(asc(financeCategories.type), asc(financeCategories.name));
  },

  async createCategory(data: {
    name: string;
    type: "income" | "expense";
    color: string;
    icon?: string;
  }): Promise<FinanceCategory> {
    const result = await db
      .insert(financeCategories)
      .values(data)
      .returning();
    return result[0];
  },

  async deleteCategory(id: number): Promise<void> {
    await db.delete(financeCategories).where(eq(financeCategories.id, id));
  },

  // === Accounts ===

  async getAccounts(): Promise<FinanceAccount[]> {
    return db
      .select()
      .from(financeAccounts)
      .orderBy(asc(financeAccounts.name));
  },

  async createAccount(data: {
    name: string;
    balance?: number;
    currency?: string;
  }): Promise<FinanceAccount> {
    const result = await db
      .insert(financeAccounts)
      .values({
        name: data.name,
        balance: data.balance ?? 0,
        currency: data.currency ?? "PHP",
      })
      .returning();
    return result[0];
  },

  async updateAccountBalance(id: number, delta: number): Promise<void> {
    await db
      .update(financeAccounts)
      .set({
        balance: sql`${financeAccounts.balance} + ${delta}`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(financeAccounts.id, id));
  },

  async deleteAccount(id: number): Promise<void> {
    await db.delete(financeAccounts).where(eq(financeAccounts.id, id));
  },

  // === Budgets ===

  async getBudgets(): Promise<BudgetWithSpent[]> {
    const budgetList = await db.select().from(budgets);

    const results: BudgetWithSpent[] = [];
    for (const budget of budgetList) {
      const cat = await db
        .select()
        .from(financeCategories)
        .where(eq(financeCategories.id, budget.categoryId))
        .limit(1);

      const now = new Date();
      const periodStart = budget.period === "weekly"
        ? toISODate(new Date(now.getTime() - now.getDay() * 86400000))
        : startOfMonth(now);
      const periodEnd = budget.period === "weekly"
        ? toISODate(new Date(now.getTime() + (6 - now.getDay()) * 86400000))
        : endOfMonth(now);

      const spentResult = await db
        .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
        .from(transactions)
        .where(
          and(
            eq(transactions.categoryId, budget.categoryId),
            eq(transactions.type, "expense"),
            gte(transactions.transactionDate, periodStart),
            lte(transactions.transactionDate, periodEnd),
          ),
        );

      results.push({
        ...budget,
        categoryName: cat[0]?.name ?? "Unknown",
        categoryColor: cat[0]?.color ?? "#888",
        spent: spentResult[0]?.total ?? 0,
      });
    }

    return results;
  },

  async createBudget(data: {
    categoryId: number;
    amount: number;
    period?: "monthly" | "weekly";
    startDate: string;
  }): Promise<Budget> {
    const result = await db
      .insert(budgets)
      .values({
        categoryId: data.categoryId,
        amount: data.amount,
        period: data.period ?? "monthly",
        startDate: data.startDate,
      })
      .returning();
    return result[0];
  },

  async deleteBudget(id: number): Promise<void> {
    await db.delete(budgets).where(eq(budgets.id, id));
  },

  // === Savings Goals ===

  async getSavingsGoals(): Promise<SavingsGoal[]> {
    return db.select().from(savingsGoals).orderBy(asc(savingsGoals.name));
  },

  async createSavingsGoal(data: {
    name: string;
    target: number;
    deadline?: string;
  }): Promise<SavingsGoal> {
    const result = await db
      .insert(savingsGoals)
      .values({ name: data.name, target: data.target, deadline: data.deadline })
      .returning();
    return result[0];
  },

  async updateSavingsGoal(
    id: number,
    data: Partial<{ name: string; target: number; current: number; deadline: string }>,
  ): Promise<void> {
    await db
      .update(savingsGoals)
      .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(savingsGoals.id, id));
  },

  async deleteSavingsGoal(id: number): Promise<void> {
    await db.delete(savingsGoals).where(eq(savingsGoals.id, id));
  },

  // === Summary / Analytics ===

  async getMonthlySummary(year: number, month: number): Promise<{
    totalIncome: number;
    totalExpense: number;
    net: number;
    byCategory: { categoryId: number; name: string; color: string; total: number }[];
  }> {
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0);
    const end = toISODate(endDate);

    const incomeResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, "income"),
          gte(transactions.transactionDate, start),
          lte(transactions.transactionDate, end),
        ),
      );

    const expenseResult = await db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, "expense"),
          gte(transactions.transactionDate, start),
          lte(transactions.transactionDate, end),
        ),
      );

    const totalIncome = incomeResult[0]?.total ?? 0;
    const totalExpense = expenseResult[0]?.total ?? 0;

    // By category (expenses only)
    const cats = await db.select().from(financeCategories);
    const byCategory: { categoryId: number; name: string; color: string; total: number }[] = [];

    for (const cat of cats) {
      const catResult = await db
        .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
        .from(transactions)
        .where(
          and(
            eq(transactions.categoryId, cat.id),
            eq(transactions.type, "expense"),
            gte(transactions.transactionDate, start),
            lte(transactions.transactionDate, end),
          ),
        );

      const total = catResult[0]?.total ?? 0;
      if (total > 0) {
        byCategory.push({
          categoryId: cat.id,
          name: cat.name,
          color: cat.color,
          total,
        });
      }
    }

    return { totalIncome, totalExpense, net: totalIncome - totalExpense, byCategory };
  },

  async getTrend(months: number): Promise<{ month: string; income: number; expense: number }[]> {
    const result: { month: string; income: number; expense: number }[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const summary = await this.getMonthlySummary(year, month);

      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      result.push({
        month: label,
        income: summary.totalIncome,
        expense: summary.totalExpense,
      });
    }

    return result;
  },

  // === Recurring Transactions ===

  async processRecurringTransactions(): Promise<number> {
    const today = toISODate(new Date());
    const recurring = await db
      .select()
      .from(transactions)
      .where(eq(transactions.isRecurring, true));

    let count = 0;
    for (const txn of recurring) {
      const recurrence = txn.recurrence as {
        interval?: string;
        nextDate?: string;
      } | null;
      if (!recurrence?.nextDate) continue;
      if (recurrence.nextDate > today) continue;

      // Create new transaction
      await this.createTransaction({
        type: txn.type as "income" | "expense" | "transfer",
        amount: txn.amount,
        description: txn.description ?? undefined,
        categoryId: txn.categoryId,
        accountId: txn.accountId,
        toAccountId: txn.toAccountId,
        transactionDate: recurrence.nextDate,
        tags: txn.tags as string[] | null,
      });

      // Calculate next date
      const nextDate = new Date(recurrence.nextDate + "T00:00:00");
      switch (recurrence.interval) {
        case "daily":
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case "weekly":
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case "monthly":
        default:
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
      }

      await db
        .update(transactions)
        .set({
          recurrence: { ...recurrence, nextDate: toISODate(nextDate) },
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(transactions.id, txn.id));

      count++;
    }

    return count;
  },
};
