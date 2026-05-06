import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import type {
  Food,
  FoodFrequencySummary,
  FoodGroupingSuggestion,
  MealEntry,
  MealType,
} from "../../shared/domain-types";
import type { FoodAnalytics } from "../../shared/ipc-types";

interface FoodRow {
  id: string;
  name: string;
  normalizedName: string;
  groupFoodId: string | null;
  createdAt: string;
  updatedAt: string;
  entryCount?: number;
  lastMealTime?: string | null;
}

interface MealEntryRow {
  id: string;
  foodId: string;
  foodName: string;
  mealType: MealType;
  mealTime: string;
  date: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsRow {
  foodId: string;
  name: string;
  count: number;
}

function normalizeFoodName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toDateKey(mealTime: string): string {
  const date = new Date(mealTime);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid meal time: ${mealTime}`);
  }
  return mealTime.slice(0, 10);
}

function parseDateKey(date: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new Error(`Invalid date: ${date}`);
  }
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function formatDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function getPeriodBounds(dateKey: string, period: "week" | "month"): { startDate: string; endDate: string } {
  const date = parseDateKey(dateKey);

  if (period === "month") {
    return {
      startDate: formatDateKey(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))),
      endDate: formatDateKey(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0))),
    };
  }

  const day = date.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setUTCDate(date.getUTCDate() + mondayOffset);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  return {
    startDate: formatDateKey(start),
    endDate: formatDateKey(end),
  };
}

function mapFood(row: FoodRow): Food {
  return {
    id: row.id,
    name: row.name,
    normalizedName: row.normalizedName,
    groupFoodId: row.groupFoodId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapMealEntry(row: MealEntryRow): MealEntry {
  return {
    id: row.id,
    foodId: row.foodId,
    foodName: row.foodName,
    mealType: row.mealType,
    mealTime: row.mealTime,
    date: row.date,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function levenshtein(a: string, b: string, maxDistance: number): number {
  if (Math.abs(a.length - b.length) > maxDistance) {
    return maxDistance + 1;
  }

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    let rowMin = current[0];

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );
      rowMin = Math.min(rowMin, current[j]);
    }

    if (rowMin > maxDistance) {
      return maxDistance + 1;
    }

    for (let j = 0; j <= b.length; j += 1) {
      previous[j] = current[j];
    }
  }

  return previous[b.length];
}

function isSubsequence(input: string, candidate: string): boolean {
  let index = 0;
  for (const char of candidate) {
    if (char === input[index]) {
      index += 1;
    }
    if (index === input.length) {
      return true;
    }
  }
  return false;
}

function scoreFood(query: string, food: FoodRow): number {
  const normalized = food.normalizedName;
  if (!query || !normalized) return 0;
  if (normalized === query) return 1000;
  if (normalized.startsWith(query)) return 850;
  if (normalized.split(" ").some((token) => token.startsWith(query))) return 760;
  if (normalized.includes(query)) return 700;
  if (isSubsequence(query.replace(/\s/g, ""), normalized.replace(/\s/g, ""))) return 540;

  const distance = levenshtein(query, normalized, 2);
  if (distance <= 2) {
    return 520 - distance * 90;
  }

  return 0;
}

export class FoodRepository {
  constructor(private readonly db: Database.Database) {}

  private hasTable(tableName: string): boolean {
    const row = this.db
      .prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1")
      .get(tableName) as { 1: number } | undefined;
    return row !== undefined;
  }

  private findFoodByNormalized(normalizedName: string): FoodRow | undefined {
    return this.db
      .prepare(
        `
          SELECT
            id,
            name,
            normalized_name AS normalizedName,
            group_food_id AS groupFoodId,
            created_at AS createdAt,
            updated_at AS updatedAt
          FROM foods
          WHERE normalized_name = ?
        `,
      )
      .get(normalizedName) as FoodRow | undefined;
  }

  private getFoodById(id: string): FoodRow | undefined {
    return this.db
      .prepare(
        `
          SELECT
            id,
            name,
            normalized_name AS normalizedName,
            group_food_id AS groupFoodId,
            created_at AS createdAt,
            updated_at AS updatedAt
          FROM foods
          WHERE id = ?
        `,
      )
      .get(id) as FoodRow | undefined;
  }

  private upsertFood(foodName: string, now: string): FoodRow {
    const normalizedName = normalizeFoodName(foodName);
    if (!normalizedName) {
      throw new Error("Food name is required");
    }

    const existing = this.findFoodByNormalized(normalizedName);
    if (existing) {
      if (existing.name !== foodName.trim()) {
        this.db
          .prepare("UPDATE foods SET name = ?, updated_at = ? WHERE id = ?")
          .run(foodName.trim(), now, existing.id);
        return { ...existing, name: foodName.trim(), updatedAt: now };
      }
      return existing;
    }

    const food: FoodRow = {
      id: randomUUID(),
      name: foodName.trim(),
      normalizedName,
      groupFoodId: null,
      createdAt: now,
      updatedAt: now,
    };

    this.db
      .prepare(
        `
          INSERT INTO foods (id, name, normalized_name, group_food_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
      )
      .run(food.id, food.name, food.normalizedName, food.groupFoodId, food.createdAt, food.updatedAt);

    return food;
  }

  private listFoodCandidates(): FoodRow[] {
    return this.db
      .prepare(
        `
          SELECT
            f.id,
            f.name,
            f.normalized_name AS normalizedName,
            f.group_food_id AS groupFoodId,
            f.created_at AS createdAt,
            f.updated_at AS updatedAt,
            COUNT(m.id) AS entryCount,
            MAX(m.meal_time) AS lastMealTime
          FROM foods f
          LEFT JOIN meal_entries m ON m.food_id = f.id
          GROUP BY f.id
          ORDER BY lastMealTime DESC, entryCount DESC, f.name ASC
          LIMIT 300
        `,
      )
      .all() as FoodRow[];
  }

  listEntries(filters?: {
    startDate?: string;
    endDate?: string;
    foodId?: string;
    query?: string;
  }): MealEntry[] {
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
    if (filters?.foodId) {
      conditions.push("(food_id = ? OR food_id IN (SELECT id FROM foods WHERE group_food_id = ?))");
      params.push(filters.foodId, filters.foodId);
    }
    if (filters?.query?.trim()) {
      conditions.push("(food_name LIKE ? COLLATE NOCASE OR notes LIKE ? COLLATE NOCASE)");
      const query = `%${filters.query.trim()}%`;
      params.push(query, query);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const rows = this.db
      .prepare(
        `
          SELECT
            id,
            food_id AS foodId,
            food_name AS foodName,
            meal_type AS mealType,
            meal_time AS mealTime,
            date,
            notes,
            created_at AS createdAt,
            updated_at AS updatedAt
          FROM meal_entries
          ${where}
          ORDER BY meal_time DESC, created_at DESC
        `,
      )
      .all(...params) as MealEntryRow[];

    return rows.map(mapMealEntry);
  }

  createEntry(data: {
    foodName: string;
    mealType: MealType;
    mealTime: string;
    notes?: string;
    confirmedGroupFoodId?: string | null;
  }): MealEntry {
    const now = new Date().toISOString();
    const id = randomUUID();
    let created: MealEntry | null = null;

    const tx = this.db.transaction(() => {
      const food = this.upsertFood(data.foodName, now);
      if (data.confirmedGroupFoodId) {
        this.setFoodGroup(food.id, data.confirmedGroupFoodId);
      }

      const entry: MealEntryRow = {
        id,
        foodId: food.id,
        foodName: data.foodName.trim(),
        mealType: data.mealType,
        mealTime: data.mealTime,
        date: toDateKey(data.mealTime),
        notes: data.notes?.trim() || null,
        createdAt: now,
        updatedAt: now,
      };

      this.db
        .prepare(
          `
            INSERT INTO meal_entries
              (id, food_id, food_name, meal_type, meal_time, date, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
        )
        .run(
          entry.id,
          entry.foodId,
          entry.foodName,
          entry.mealType,
          entry.mealTime,
          entry.date,
          entry.notes,
          entry.createdAt,
          entry.updatedAt,
        );

      created = mapMealEntry(entry);
    });

    tx();
    return created!;
  }

  updateEntry(data: {
    id: string;
    foodName?: string;
    mealType?: MealType;
    mealTime?: string;
    notes?: string | null;
    confirmedGroupFoodId?: string | null;
  }): void {
    const tx = this.db.transaction(() => {
      const existing = this.db
        .prepare(
          `
            SELECT
              id,
              food_id AS foodId,
              food_name AS foodName,
              meal_type AS mealType,
              meal_time AS mealTime,
              date,
              notes,
              created_at AS createdAt,
              updated_at AS updatedAt
            FROM meal_entries
            WHERE id = ?
          `,
        )
        .get(data.id) as MealEntryRow | undefined;

      if (!existing) return;

      const now = new Date().toISOString();
      const food = data.foodName ? this.upsertFood(data.foodName, now) : this.getFoodById(existing.foodId);
      if (!food) return;

      if (data.confirmedGroupFoodId !== undefined) {
        this.setFoodGroup(food.id, data.confirmedGroupFoodId);
      }

      const mealTime = data.mealTime ?? existing.mealTime;
      this.db
        .prepare(
          `
            UPDATE meal_entries
            SET food_id = ?,
                food_name = ?,
                meal_type = ?,
                meal_time = ?,
                date = ?,
                notes = ?,
                updated_at = ?
            WHERE id = ?
          `,
        )
        .run(
          food.id,
          data.foodName?.trim() ?? existing.foodName,
          data.mealType ?? existing.mealType,
          mealTime,
          toDateKey(mealTime),
          data.notes === undefined ? existing.notes : data.notes?.trim() || null,
          now,
          data.id,
        );
    });

    tx();
  }

  deleteEntry(id: string): void {
    const tx = this.db.transaction(() => {
      this.db.prepare("DELETE FROM meal_entries WHERE id = ?").run(id);
      if (this.hasTable("item_tags")) {
        this.db
          .prepare("DELETE FROM item_tags WHERE item_type = 'food_entry' AND item_id = ?")
          .run(id);
      }
    });

    tx();
  }

  suggestFoods(data: { query: string; limit?: number }): Food[] {
    const query = normalizeFoodName(data.query);
    if (!query) return [];

    return this.listFoodCandidates()
      .map((food) => ({ food, score: scoreFood(query, food) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if ((b.food.entryCount ?? 0) !== (a.food.entryCount ?? 0)) {
          return (b.food.entryCount ?? 0) - (a.food.entryCount ?? 0);
        }
        return a.food.name.localeCompare(b.food.name);
      })
      .slice(0, data.limit ?? 8)
      .map((item) => mapFood(item.food));
  }

  getGroupingSuggestion(data: { foodName: string }): FoodGroupingSuggestion | null {
    const inputNormalized = normalizeFoodName(data.foodName);
    if (!inputNormalized || this.findFoodByNormalized(inputNormalized)) {
      return null;
    }

    const best = this.listFoodCandidates()
      .map((food) => ({ food, score: scoreFood(inputNormalized, food) }))
      .filter((item) => item.score >= 340)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if ((b.food.entryCount ?? 0) !== (a.food.entryCount ?? 0)) {
          return (b.food.entryCount ?? 0) - (a.food.entryCount ?? 0);
        }
        return a.food.name.localeCompare(b.food.name);
      })[0];

    if (!best) return null;

    const suppressed = this.db
      .prepare(
        `
          SELECT 1
          FROM food_group_suppressions
          WHERE input_normalized = ? AND suggested_food_id = ?
          LIMIT 1
        `,
      )
      .get(inputNormalized, best.food.id) as { 1: number } | undefined;

    if (suppressed) return null;

    return {
      inputName: data.foodName,
      inputNormalized,
      suggestedFood: mapFood(best.food),
      score: best.score,
    };
  }

  suppressGroupingSuggestion(data: { inputName: string; suggestedFoodId: string }): void {
    const inputNormalized = normalizeFoodName(data.inputName);
    if (!inputNormalized) return;

    this.db
      .prepare(
        `
          INSERT OR IGNORE INTO food_group_suppressions
            (input_normalized, suggested_food_id, created_at)
          VALUES (?, ?, ?)
        `,
      )
      .run(inputNormalized, data.suggestedFoodId, new Date().toISOString());
  }

  setFoodGroup(foodId: string, groupFoodId: string | null): void {
    this.db
      .prepare("UPDATE foods SET group_food_id = ?, updated_at = ? WHERE id = ?")
      .run(groupFoodId, new Date().toISOString(), foodId);
  }

  getAnalytics(data: { date: string; period: "week" | "month" }): FoodAnalytics {
    const { startDate, endDate } = getPeriodBounds(data.date, data.period);
    const rows = this.db
      .prepare(
        `
          SELECT
            COALESCE(g.id, f.id) AS foodId,
            COALESCE(g.name, f.name) AS name,
            COUNT(m.id) AS count
          FROM meal_entries m
          JOIN foods f ON f.id = m.food_id
          LEFT JOIN foods g ON g.id = f.group_food_id
          WHERE m.date >= ? AND m.date <= ?
          GROUP BY COALESCE(g.id, f.id), COALESCE(g.name, f.name)
          ORDER BY count DESC, COALESCE(g.name, f.name) ASC
        `,
      )
      .all(startDate, endDate) as AnalyticsRow[];

    const mostEatenFoods: FoodFrequencySummary[] = rows.map((row) => ({
      foodId: row.foodId,
      name: row.name,
      count: row.count,
    }));

    return {
      period: data.period,
      date: data.date,
      startDate,
      endDate,
      totalEntries: mostEatenFoods.reduce((total, item) => total + item.count, 0),
      mostEatenFoods,
    };
  }
}
