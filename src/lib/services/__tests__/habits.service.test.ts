import { describe, it, expect, beforeEach, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";
import { toISODate } from "@/lib/utils/dates";

// Create a test db
const sqlite = new Database(":memory:");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS habit_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES habit_categories(id),
    frequency TEXT NOT NULL,
    frequency_value INTEGER,
    target_days TEXT,
    reminder_time TEXT,
    is_archived INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );
  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    log_date TEXT NOT NULL,
    completed INTEGER DEFAULT 1,
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS habit_logs_habit_id_log_date_unique
    ON habit_logs(habit_id, log_date);
`);

const testDb = drizzle(sqlite, { schema });

// Mock the db module before importing the service
vi.mock("@/lib/db", () => ({
  db: testDb,
  getDb: () => testDb,
}));

// Now import the service which will use our mocked db
const { habitsService } = await import("../habits.service");

describe("habitsService", () => {
  beforeEach(() => {
    sqlite.exec("DELETE FROM habit_logs");
    sqlite.exec("DELETE FROM habits");
    sqlite.exec("DELETE FROM habit_categories");
  });

  describe("categories", () => {
    it("should create and list categories", async () => {
      const cat = await habitsService.createCategory({
        name: "Health",
        color: "#10b981",
      });
      expect(cat.name).toBe("Health");

      const categories = await habitsService.getCategories();
      expect(categories.length).toBe(1);
    });
  });

  describe("habits CRUD", () => {
    it("should create a habit", async () => {
      const habit = await habitsService.createHabit({
        name: "Meditation",
        frequency: "daily",
      });
      expect(habit.name).toBe("Meditation");
      expect(habit.frequency).toBe("daily");
    });

    it("should list active habits excluding archived", async () => {
      await habitsService.createHabit({ name: "Active", frequency: "daily" });
      const archived = await habitsService.createHabit({ name: "Archived", frequency: "daily" });
      await habitsService.archiveHabit(archived.id);

      const habits = await habitsService.getHabits();
      expect(habits.length).toBe(1);
      expect(habits[0].name).toBe("Active");
    });
  });

  describe("logging", () => {
    it("should log and unlog a habit", async () => {
      const habit = await habitsService.createHabit({ name: "Test", frequency: "daily" });
      const today = toISODate(new Date());

      await habitsService.logHabit(habit.id, today);
      let logs = await habitsService.getLogsForDateRange(habit.id, today, today);
      expect(logs.length).toBe(1);

      await habitsService.unlogHabit(habit.id, today);
      logs = await habitsService.getLogsForDateRange(habit.id, today, today);
      expect(logs.length).toBe(0);
    });

    it("should upsert on duplicate log", async () => {
      const habit = await habitsService.createHabit({ name: "Test", frequency: "daily" });
      const today = toISODate(new Date());

      await habitsService.logHabit(habit.id, today, "first");
      await habitsService.logHabit(habit.id, today, "updated");

      const logs = await habitsService.getLogsForDateRange(habit.id, today, today);
      expect(logs.length).toBe(1);
      expect(logs[0].note).toBe("updated");
    });
  });

  describe("streaks", () => {
    it("should calculate daily streak", async () => {
      const habit = await habitsService.createHabit({ name: "Daily", frequency: "daily" });
      const today = new Date();

      for (let i = 0; i < 5; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        await habitsService.logHabit(habit.id, toISODate(d));
      }

      const streak = await habitsService.getStreak(habit.id);
      expect(streak.current).toBe(5);
      expect(streak.best).toBe(5);
    });

    it("should break daily streak on gap", async () => {
      const habit = await habitsService.createHabit({ name: "Daily", frequency: "daily" });
      const today = new Date();

      // Log today and yesterday (streak of 2)
      await habitsService.logHabit(habit.id, toISODate(today));
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      await habitsService.logHabit(habit.id, toISODate(yesterday));

      // Skip day -2, then log days -3, -4, -5 (streak of 3)
      for (let i = 3; i <= 5; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        await habitsService.logHabit(habit.id, toISODate(d));
      }

      const streak = await habitsService.getStreak(habit.id);
      expect(streak.current).toBe(2);
      expect(streak.best).toBe(3);
    });

    it("should return 0 streak when no logs", async () => {
      const habit = await habitsService.createHabit({ name: "Empty", frequency: "daily" });
      const streak = await habitsService.getStreak(habit.id);
      expect(streak.current).toBe(0);
      expect(streak.best).toBe(0);
    });
  });

  describe("completion rate", () => {
    it("should calculate correct rate", async () => {
      const habit = await habitsService.createHabit({ name: "Test", frequency: "daily" });
      const today = new Date();

      // Log 15 of the last 30 days
      for (let i = 0; i < 30; i += 2) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        await habitsService.logHabit(habit.id, toISODate(d));
      }

      const rate = await habitsService.getCompletionRate(habit.id, 30);
      expect(rate).toBe(50);
    });
  });

  describe("stats", () => {
    it("should return complete stats", async () => {
      const habit = await habitsService.createHabit({ name: "Test", frequency: "daily" });
      const today = new Date();

      for (let i = 0; i < 3; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        await habitsService.logHabit(habit.id, toISODate(d));
      }

      const stats = await habitsService.getHabitStats(habit.id);
      expect(stats.currentStreak).toBe(3);
      expect(stats.totalCompletions).toBe(3);
      expect(stats.completionRate30d).toBe(10);
    });
  });
});
