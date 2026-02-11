import { db } from "@/lib/db";
import {
  habits,
  habitLogs,
  habitCategories,
} from "@/lib/db/schema";
import { eq, and, gte, lte, desc, asc, sql, isNull } from "drizzle-orm";
import { toISODate, getDaysInRange } from "@/lib/utils/dates";

// --- Types ---

export type HabitCategory = typeof habitCategories.$inferSelect;
export type Habit = typeof habits.$inferSelect;
export type HabitLog = typeof habitLogs.$inferSelect;

export interface HabitWithLogs extends Habit {
  category?: HabitCategory | null;
  logs: HabitLog[];
  stats?: {
    currentStreak: number;
    bestStreak: number;
    completionRate30d: number;
    totalCompletions: number;
  };
}

export interface CreateHabitInput {
  name: string;
  description?: string;
  categoryId?: number | null;
  frequency: "daily" | "weekly" | "monthly" | "every_n_days";
  frequencyValue?: number | null;
  targetDays?: string[] | null;
  reminderTime?: string | null;
}

// --- Service ---

export const habitsService = {
  // === Categories ===

  async getCategories(): Promise<HabitCategory[]> {
    return db
      .select()
      .from(habitCategories)
      .orderBy(asc(habitCategories.sortOrder), asc(habitCategories.name));
  },

  async createCategory(data: {
    name: string;
    color: string;
    icon?: string;
  }): Promise<HabitCategory> {
    const result = await db
      .insert(habitCategories)
      .values(data)
      .returning();
    return result[0];
  },

  async updateCategory(
    id: number,
    data: Partial<{ name: string; color: string; icon: string }>,
  ): Promise<void> {
    await db
      .update(habitCategories)
      .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(habitCategories.id, id));
  },

  async deleteCategory(id: number): Promise<void> {
    await db.delete(habitCategories).where(eq(habitCategories.id, id));
  },

  // === Habits ===

  async getHabits(opts?: {
    categoryId?: number;
    includeArchived?: boolean;
    date?: string;
  }): Promise<HabitWithLogs[]> {
    const conditions = [];
    if (!opts?.includeArchived) {
      conditions.push(eq(habits.isArchived, false));
    }
    if (opts?.categoryId) {
      conditions.push(eq(habits.categoryId, opts.categoryId));
    }

    const habitList = await db
      .select()
      .from(habits)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(habits.sortOrder), asc(habits.name));

    const today = opts?.date || toISODate(new Date());
    const thirtyDaysAgo = toISODate(
      new Date(new Date(today + "T00:00:00").getTime() - 30 * 24 * 60 * 60 * 1000),
    );

    const results: HabitWithLogs[] = [];
    for (const habit of habitList) {
      const logs = await db
        .select()
        .from(habitLogs)
        .where(
          and(
            eq(habitLogs.habitId, habit.id),
            gte(habitLogs.logDate, thirtyDaysAgo),
            lte(habitLogs.logDate, today),
          ),
        )
        .orderBy(desc(habitLogs.logDate));

      let category: HabitCategory | null = null;
      if (habit.categoryId) {
        const cats = await db
          .select()
          .from(habitCategories)
          .where(eq(habitCategories.id, habit.categoryId))
          .limit(1);
        category = cats[0] ?? null;
      }

      const stats = await this.getHabitStats(habit.id);

      results.push({ ...habit, category, logs, stats });
    }

    return results;
  },

  async getHabit(id: number): Promise<HabitWithLogs | null> {
    const result = await db
      .select()
      .from(habits)
      .where(eq(habits.id, id))
      .limit(1);
    if (!result[0]) return null;

    const habit = result[0];
    const logs = await db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.habitId, id))
      .orderBy(desc(habitLogs.logDate));

    let category: HabitCategory | null = null;
    if (habit.categoryId) {
      const cats = await db
        .select()
        .from(habitCategories)
        .where(eq(habitCategories.id, habit.categoryId))
        .limit(1);
      category = cats[0] ?? null;
    }

    const stats = await this.getHabitStats(id);

    return { ...habit, category, logs, stats };
  },

  async createHabit(data: CreateHabitInput): Promise<Habit> {
    const result = await db
      .insert(habits)
      .values({
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        frequency: data.frequency,
        frequencyValue: data.frequencyValue,
        targetDays: data.targetDays,
        reminderTime: data.reminderTime,
      })
      .returning();
    return result[0];
  },

  async updateHabit(
    id: number,
    data: Partial<CreateHabitInput & { isArchived: boolean; sortOrder: number }>,
  ): Promise<void> {
    await db
      .update(habits)
      .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(habits.id, id));
  },

  async archiveHabit(id: number): Promise<void> {
    await db
      .update(habits)
      .set({ isArchived: true, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(habits.id, id));
  },

  async deleteHabit(id: number): Promise<void> {
    await db.delete(habits).where(eq(habits.id, id));
  },

  // === Logging ===

  async logHabit(habitId: number, date: string, note?: string): Promise<void> {
    await db
      .insert(habitLogs)
      .values({ habitId, logDate: date, completed: true, note })
      .onConflictDoUpdate({
        target: [habitLogs.habitId, habitLogs.logDate],
        set: { completed: true, note },
      });
  },

  async unlogHabit(habitId: number, date: string): Promise<void> {
    await db
      .delete(habitLogs)
      .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.logDate, date)));
  },

  async getLogsForDateRange(
    habitId: number,
    start: string,
    end: string,
  ): Promise<HabitLog[]> {
    return db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.habitId, habitId),
          gte(habitLogs.logDate, start),
          lte(habitLogs.logDate, end),
        ),
      )
      .orderBy(asc(habitLogs.logDate));
  },

  // === Streak & Stats ===

  async getStreak(habitId: number): Promise<{ current: number; best: number }> {
    const allLogs = await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.completed, true)))
      .orderBy(desc(habitLogs.logDate));

    if (allLogs.length === 0) return { current: 0, best: 0 };

    const habit = await db
      .select()
      .from(habits)
      .where(eq(habits.id, habitId))
      .limit(1);
    if (!habit[0]) return { current: 0, best: 0 };

    const frequency = habit[0].frequency;
    const frequencyValue = habit[0].frequencyValue ?? 1;
    const logDates = new Set(allLogs.map((l) => l.logDate));
    const sortedDates = [...logDates].sort().reverse();

    if (frequency === "daily") {
      return calculateDailyStreak(sortedDates);
    } else if (frequency === "every_n_days") {
      return calculateEveryNDaysStreak(sortedDates, frequencyValue);
    } else if (frequency === "weekly") {
      return calculateWeeklyStreak(sortedDates);
    } else if (frequency === "monthly") {
      return calculateMonthlyStreak(sortedDates);
    }

    return { current: 0, best: 0 };
  },

  async getCompletionRate(habitId: number, days: number): Promise<number> {
    const today = toISODate(new Date());
    const startDate = toISODate(
      new Date(Date.now() - days * 24 * 60 * 60 * 1000),
    );

    const logs = await db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.habitId, habitId),
          eq(habitLogs.completed, true),
          gte(habitLogs.logDate, startDate),
          lte(habitLogs.logDate, today),
        ),
      );

    return days > 0 ? Math.round((logs.length / days) * 100) : 0;
  },

  async getHabitStats(habitId: number): Promise<{
    currentStreak: number;
    bestStreak: number;
    completionRate30d: number;
    totalCompletions: number;
  }> {
    const streak = await this.getStreak(habitId);
    const completionRate30d = await this.getCompletionRate(habitId, 30);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.completed, true)));

    return {
      currentStreak: streak.current,
      bestStreak: streak.best,
      completionRate30d,
      totalCompletions: totalResult[0]?.count ?? 0,
    };
  },
};

// --- Streak Helpers ---

function calculateDailyStreak(sortedDatesDesc: string[]): {
  current: number;
  best: number;
} {
  if (sortedDatesDesc.length === 0) return { current: 0, best: 0 };

  const today = toISODate(new Date());
  const yesterday = toISODate(new Date(Date.now() - 24 * 60 * 60 * 1000));

  // Current streak: must include today or yesterday
  let current = 0;
  const firstDate = sortedDatesDesc[0];
  if (firstDate === today || firstDate === yesterday) {
    current = 1;
    for (let i = 1; i < sortedDatesDesc.length; i++) {
      const prev = new Date(sortedDatesDesc[i - 1] + "T00:00:00");
      const curr = new Date(sortedDatesDesc[i] + "T00:00:00");
      const diffDays = (prev.getTime() - curr.getTime()) / (24 * 60 * 60 * 1000);
      if (diffDays === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  // Best streak
  const sorted = [...sortedDatesDesc].sort();
  let best = 1;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const curr = new Date(sorted[i] + "T00:00:00");
    const diffDays = (curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);
    if (diffDays === 1) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 1;
    }
  }

  return { current, best: Math.max(best, current) };
}

function calculateEveryNDaysStreak(
  sortedDatesDesc: string[],
  n: number,
): { current: number; best: number } {
  if (sortedDatesDesc.length === 0) return { current: 0, best: 0 };

  const today = new Date();
  const firstDate = new Date(sortedDatesDesc[0] + "T00:00:00");
  const daysSinceFirst =
    (today.getTime() - firstDate.getTime()) / (24 * 60 * 60 * 1000);

  let current = 0;
  if (daysSinceFirst <= n) {
    current = 1;
    for (let i = 1; i < sortedDatesDesc.length; i++) {
      const prev = new Date(sortedDatesDesc[i - 1] + "T00:00:00");
      const curr = new Date(sortedDatesDesc[i] + "T00:00:00");
      const gap = (prev.getTime() - curr.getTime()) / (24 * 60 * 60 * 1000);
      if (gap <= n) {
        current++;
      } else {
        break;
      }
    }
  }

  const sorted = [...sortedDatesDesc].sort();
  let best = 1;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const curr = new Date(sorted[i] + "T00:00:00");
    const gap = (curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);
    if (gap <= n) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 1;
    }
  }

  return { current, best: Math.max(best, current) };
}

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const dayOfYear = Math.ceil(
    (d.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000),
  );
  const week = Math.ceil((dayOfYear + jan1.getDay()) / 7);
  return `${d.getFullYear()}-W${week}`;
}

function calculateWeeklyStreak(sortedDatesDesc: string[]): {
  current: number;
  best: number;
} {
  if (sortedDatesDesc.length === 0) return { current: 0, best: 0 };

  const weeks = [...new Set(sortedDatesDesc.map(getWeekKey))].sort().reverse();
  const currentWeek = getWeekKey(toISODate(new Date()));
  const lastWeek = getWeekKey(
    toISODate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
  );

  let current = 0;
  if (weeks[0] === currentWeek || weeks[0] === lastWeek) {
    current = 1;
    for (let i = 1; i < weeks.length; i++) {
      const prevParts = weeks[i - 1].split("-W");
      const currParts = weeks[i].split("-W");
      const prevNum = parseInt(prevParts[0]) * 52 + parseInt(prevParts[1]);
      const currNum = parseInt(currParts[0]) * 52 + parseInt(currParts[1]);
      if (prevNum - currNum === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  const sortedWeeks = [...weeks].sort();
  let best = 1;
  let streak = 1;
  for (let i = 1; i < sortedWeeks.length; i++) {
    const prevParts = sortedWeeks[i - 1].split("-W");
    const currParts = sortedWeeks[i].split("-W");
    const prevNum = parseInt(prevParts[0]) * 52 + parseInt(prevParts[1]);
    const currNum = parseInt(currParts[0]) * 52 + parseInt(currParts[1]);
    if (currNum - prevNum === 1) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 1;
    }
  }

  return { current, best: Math.max(best, current) };
}

function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7); // YYYY-MM
}

function calculateMonthlyStreak(sortedDatesDesc: string[]): {
  current: number;
  best: number;
} {
  if (sortedDatesDesc.length === 0) return { current: 0, best: 0 };

  const months = [...new Set(sortedDatesDesc.map(getMonthKey))].sort().reverse();
  const currentMonth = getMonthKey(toISODate(new Date()));
  const lastMonth = getMonthKey(
    toISODate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)),
  );

  let current = 0;
  if (months[0] === currentMonth || months[0] === lastMonth) {
    current = 1;
    for (let i = 1; i < months.length; i++) {
      const prev = months[i - 1].split("-").map(Number);
      const curr = months[i].split("-").map(Number);
      const prevNum = prev[0] * 12 + prev[1];
      const currNum = curr[0] * 12 + curr[1];
      if (prevNum - currNum === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  const sortedMonths = [...months].sort();
  let best = 1;
  let streak = 1;
  for (let i = 1; i < sortedMonths.length; i++) {
    const prev = sortedMonths[i - 1].split("-").map(Number);
    const curr = sortedMonths[i].split("-").map(Number);
    const prevNum = prev[0] * 12 + prev[1];
    const currNum = curr[0] * 12 + curr[1];
    if (currNum - prevNum === 1) {
      streak++;
      best = Math.max(best, streak);
    } else {
      streak = 1;
    }
  }

  return { current, best: Math.max(best, current) };
}
