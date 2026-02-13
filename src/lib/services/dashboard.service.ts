import { db } from "@/lib/db";
import {
  habits,
  habitLogs,
  journalEntries,
  transactions,
  financeCategories,
  budgets,
  tasks,
} from "@/lib/db/schema";
import { eq, and, gte, lte, desc, asc, isNull, sql } from "drizzle-orm";
import { toISODate } from "@/lib/utils/dates";

// --- Types ---

export interface TodaySnapshot {
  greeting: string;
  date: string;
  habitsDue: {
    id: number;
    name: string;
    completed: boolean;
    frequency: string;
  }[];
  recentJournal: {
    id: number;
    title: string | null;
    mood: string | null;
    entryDate: string;
  }[];
  budgetSnapshot: {
    categoryName: string;
    budgetAmount: number;
    spent: number;
    color: string;
  }[];
  upcomingTasks: {
    id: number;
    title: string;
    dueDate: string | null;
    priority: number | null;
    isCompleted: boolean | null;
  }[];
  stats: {
    habitsCompletedToday: number;
    habitsTotalToday: number;
    tasksCompleted: number;
    tasksPending: number;
    journalEntriesToday: number;
  };
}

// --- Service ---

export const dashboardService = {
  async getTodaySnapshot(): Promise<TodaySnapshot> {
    const today = toISODate(new Date());
    const now = new Date();

    // Greeting based on time of day
    const hour = now.getHours();
    let greeting = "Good morning";
    if (hour >= 12 && hour < 17) greeting = "Good afternoon";
    else if (hour >= 17) greeting = "Good evening";

    // --- Habits due today ---
    const allHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.isArchived, false));

    const todayLogs = await db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.logDate, today));

    const loggedHabitIds = new Set(todayLogs.map((l) => l.habitId));

    const habitsDue = allHabits.map((h) => ({
      id: h.id,
      name: h.name,
      completed: loggedHabitIds.has(h.id),
      frequency: h.frequency,
    }));

    // --- Recent Journal entries ---
    const recentJournal = await db
      .select({
        id: journalEntries.id,
        title: journalEntries.title,
        mood: journalEntries.mood,
        entryDate: journalEntries.entryDate,
      })
      .from(journalEntries)
      .where(isNull(journalEntries.deletedAt))
      .orderBy(desc(journalEntries.entryDate))
      .limit(3);

    // --- Budget snapshot (current month) ---
    const monthStart = `${today.substring(0, 7)}-01`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthEnd = toISODate(nextMonth);

    const allBudgets = await db
      .select({
        categoryId: budgets.categoryId,
        amount: budgets.amount,
        categoryName: financeCategories.name,
        color: financeCategories.color,
      })
      .from(budgets)
      .innerJoin(
        financeCategories,
        eq(budgets.categoryId, financeCategories.id),
      );

    const monthTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.type, "expense"),
          gte(transactions.transactionDate, monthStart),
          lte(transactions.transactionDate, monthEnd),
        ),
      );

    const spentByCategory = new Map<number, number>();
    for (const t of monthTransactions) {
      if (t.categoryId) {
        spentByCategory.set(
          t.categoryId,
          (spentByCategory.get(t.categoryId) || 0) + t.amount,
        );
      }
    }

    const budgetSnapshot = allBudgets.map((b) => ({
      categoryName: b.categoryName,
      budgetAmount: b.amount,
      spent: spentByCategory.get(b.categoryId) || 0,
      color: b.color,
    }));

    // --- Upcoming tasks ---
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureStr = toISODate(futureDate);

    const upcomingTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        dueDate: tasks.dueDate,
        priority: tasks.priority,
        isCompleted: tasks.isCompleted,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.isCompleted, false),
          isNull(tasks.parentId),
          lte(tasks.dueDate, futureStr),
        ),
      )
      .orderBy(asc(tasks.dueDate))
      .limit(5);

    // --- Stats ---
    const allTasks = await db
      .select()
      .from(tasks)
      .where(isNull(tasks.parentId));

    const todayJournal = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          isNull(journalEntries.deletedAt),
          sql`substr(${journalEntries.entryDate}, 1, 10) = ${today}`,
        ),
      );

    return {
      greeting,
      date: today,
      habitsDue,
      recentJournal,
      budgetSnapshot,
      upcomingTasks,
      stats: {
        habitsCompletedToday: habitsDue.filter((h) => h.completed).length,
        habitsTotalToday: habitsDue.length,
        tasksCompleted: allTasks.filter((t) => t.isCompleted).length,
        tasksPending: allTasks.filter((t) => !t.isCompleted).length,
        journalEntriesToday: todayJournal.length,
      },
    };
  },
};
