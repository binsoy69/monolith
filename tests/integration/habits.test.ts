import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from "vitest";
import * as schema from "@/lib/db/schema";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";

type HabitsService = typeof import("@/lib/services/habits.service").habitsService;

// Setup Test DB
const sqlite = new Database(":memory:");
const testDb = drizzle(sqlite, { schema });
let habitsService!: HabitsService;

// Apply migrations
beforeAll(async () => {
  const migrationsFolder = path.join(process.cwd(), "src/lib/db/migrations");
  migrate(testDb, { migrationsFolder });

  (globalThis as typeof globalThis & { __monolithDb?: typeof testDb }).__monolithDb = testDb;
  vi.resetModules();
  ({ habitsService } = await import("@/lib/services/habits.service"));
});

afterAll(() => {
  delete (globalThis as typeof globalThis & { __monolithDb?: unknown }).__monolithDb;
  sqlite.close();
});

describe("Habits Integration", () => {
  beforeEach(async () => {
    // Clear tables
    await testDb.delete(schema.habitLogs);
    await testDb.delete(schema.habits);
    await testDb.delete(schema.habitCategories);
  });

  it("should create and retrieve a habit", async () => {
    const category = await habitsService.createCategory({
      name: "Health",
      color: "red",
    });
    const habit = await habitsService.createHabit({
      name: "Run",
      frequency: "daily",
      categoryId: category.id,
    });

    const fetched = await habitsService.getHabit(habit.id);
    expect(fetched).toBeDefined();
    expect(fetched?.name).toBe("Run");
    expect(fetched?.category?.name).toBe("Health");
  });

  it("should log completion and update streak", async () => {
    const habit = await habitsService.createHabit({
      name: "Read",
      frequency: "daily",
    });

    const today = new Date().toISOString().split("T")[0];
    await habitsService.logHabit(habit.id, today);

    const stats = await habitsService.getHabitStats(habit.id);
    expect(stats.currentStreak).toBe(1);
    expect(stats.totalCompletions).toBe(1);
  });
});
