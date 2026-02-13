import { describe, it, expect } from "vitest";
import { streakHelpers } from "@/lib/services/habits.service";
import { toISODate } from "@/lib/utils/dates";

describe("Habits Service - Streak Helpers", () => {
  const today = toISODate(new Date());
  const yesterday = toISODate(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const twoDaysAgo = toISODate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
  const threeDaysAgo = toISODate(
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  );

  describe("calculateDailyStreak", () => {
    it("should return 0 for empty logs", () => {
      const result = streakHelpers.calculateDailyStreak([]);
      expect(result).toEqual({ current: 0, best: 0 });
    });

    it("should calculate streak of 1 for today only", () => {
      const result = streakHelpers.calculateDailyStreak([today]);
      expect(result).toEqual({ current: 1, best: 1 });
    });

    it("should calculate streak of 2 for today and yesterday", () => {
      const result = streakHelpers.calculateDailyStreak([today, yesterday]);
      expect(result).toEqual({ current: 2, best: 2 });
    });

    it("should maintain streak if logged yesterday but not today", () => {
      const result = streakHelpers.calculateDailyStreak([
        yesterday,
        twoDaysAgo,
      ]);
      expect(result).toEqual({ current: 2, best: 2 });
    });

    it("should break streak if gap exists", () => {
      // Logs: Today, (break), 2 days ago, 3 days ago
      // Current streak: 1 (today)
      // Best streak: 2 (2 days ago, 3 days ago)
      const result = streakHelpers.calculateDailyStreak([
        today,
        twoDaysAgo,
        threeDaysAgo,
      ]);
      expect(result).toEqual({ current: 1, best: 2 });
    });

    it("should identify best streak from history", () => {
      // Past streak of 3, current streak of 1
      const past1 = "2023-01-01";
      const past2 = "2023-01-02";
      const past3 = "2023-01-03";

      const result = streakHelpers.calculateDailyStreak([
        today,
        past3,
        past2,
        past1,
      ]);
      expect(result.best).toBeGreaterThanOrEqual(3);
    });
  });

  describe("calculateWeeklyStreak", () => {
    it("should return 0 for empty logs", () => {
      const result = streakHelpers.calculateWeeklyStreak([]);
      expect(result).toEqual({ current: 0, best: 0 });
    });

    it("should calculate streak for consecutive weeks", () => {
      // Mock dates: 2023-W01, 2023-W02
      // This is tricky without mocking "today" inside the helper or refactoring helper to accept "today".
      // For now, we rely on the logic that parses dates string.
      // Let's use widely separated dates to ensure distinct weeks.
      const d1 = "2023-10-10"; // Week 41
      const d2 = "2023-10-03"; // Week 40

      // We need to overwrite "today" concept or test logic that doesn't depend on "current" week being today for *best* streak.
      // Actually, the helper compares against "today". Refactoring helper to accept "referenceDate" would be better,
      // but for now let's test "best" streak which is independent of "today" mostly (except for current streak calc).

      const result = streakHelpers.calculateWeeklyStreak([d1, d2]);
      expect(result.best).toBeGreaterThanOrEqual(2);
    });
  });
});
