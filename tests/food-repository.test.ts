// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { FoodRepository } from '../src/main/repositories/FoodRepository'

function createTestDb(): Database.Database {
  const db = new Database(':memory:')
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(`
    CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL UNIQUE,
      group_food_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meal_entries (
      id TEXT PRIMARY KEY,
      food_id TEXT NOT NULL,
      food_name TEXT NOT NULL,
      meal_type TEXT NOT NULL,
      meal_time TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS food_group_suppressions (
      input_normalized TEXT NOT NULL,
      suggested_food_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY(input_normalized, suggested_food_id)
    );
    CREATE TABLE IF NOT EXISTS item_tags (
      tag_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (tag_id, item_type, item_id)
    );
    CREATE INDEX IF NOT EXISTS idx_foods_normalized_name ON foods(normalized_name);
    CREATE INDEX IF NOT EXISTS idx_foods_group_food_id ON foods(group_food_id);
    CREATE INDEX IF NOT EXISTS idx_meal_entries_date_meal_time ON meal_entries(date, meal_time);
    CREATE INDEX IF NOT EXISTS idx_meal_entries_food_id_date ON meal_entries(food_id, date);
    CREATE INDEX IF NOT EXISTS idx_food_group_suppressions_pair
      ON food_group_suppressions(input_normalized, suggested_food_id);
  `)
  return db
}

describe('FoodRepository', () => {
  let db: Database.Database
  let repo: FoodRepository

  beforeEach(() => {
    db = createTestDb()
    repo = new FoodRepository(db)
  })

  it('creates a canonical food and meal entry with date derived from mealTime', () => {
    const entry = repo.createEntry({
      foodName: 'Pizza',
      mealType: 'lunch',
      mealTime: '2026-05-06T12:30:00.000Z',
      notes: 'Two slices',
    })

    expect(entry.foodName).toBe('Pizza')
    expect(entry.mealType).toBe('lunch')
    expect(entry.mealTime).toBe('2026-05-06T12:30:00.000Z')
    expect(entry.date).toBe('2026-05-06')
    expect(entry.notes).toBe('Two slices')

    const foods = db.prepare('SELECT * FROM foods').all()
    expect(foods).toHaveLength(1)
  })

  it('reuses the existing food row for the same normalized food', () => {
    const first = repo.createEntry({
      foodName: 'Pizza',
      mealType: 'lunch',
      mealTime: '2026-05-06T12:30:00.000Z',
    })
    const second = repo.createEntry({
      foodName: ' pizza ',
      mealType: 'dinner',
      mealTime: '2026-05-07T19:15:00.000Z',
    })

    expect(second.foodId).toBe(first.foodId)
    expect(db.prepare('SELECT COUNT(*) AS count FROM foods').get()).toEqual({ count: 1 })
  })

  it('returns typo-tolerant food suggestions from existing history', () => {
    repo.createEntry({
      foodName: 'Pizza',
      mealType: 'dinner',
      mealTime: '2026-05-06T19:00:00.000Z',
    })
    repo.createEntry({
      foodName: 'Pasta',
      mealType: 'dinner',
      mealTime: '2026-05-07T19:00:00.000Z',
    })

    const suggestions = repo.suggestFoods({ query: 'piza' })

    expect(suggestions.map((food) => food.name)).toContain('Pizza')
    expect(suggestions[0].name).toBe('Pizza')
  })

  it('returns grouping suggestions only for existing foods', () => {
    const unknownSuggestion = repo.getGroupingSuggestion({ foodName: 'new cereal' })
    expect(unknownSuggestion).toBeNull()

    const entry = repo.createEntry({
      foodName: 'Pizza',
      mealType: 'dinner',
      mealTime: '2026-05-06T19:00:00.000Z',
    })

    const exactSuggestion = repo.getGroupingSuggestion({ foodName: 'pizza' })
    expect(exactSuggestion).toBeNull()

    const suggestion = repo.getGroupingSuggestion({ foodName: 'piza' })
    expect(suggestion?.suggestedFood.id).toBe(entry.foodId)
    expect(suggestion?.suggestedFood.name).toBe('Pizza')
  })

  it('suppresses a specific input and suggested food pair', () => {
    const entry = repo.createEntry({
      foodName: 'Pizza',
      mealType: 'dinner',
      mealTime: '2026-05-06T19:00:00.000Z',
    })

    expect(repo.getGroupingSuggestion({ foodName: 'piza' })?.suggestedFood.id).toBe(entry.foodId)

    repo.suppressGroupingSuggestion({
      inputName: 'piza',
      suggestedFoodId: entry.foodId,
    })

    expect(repo.getGroupingSuggestion({ foodName: 'piza' })).toBeNull()
  })

  it('returns week and month frequency counts with confirmed group rollups', () => {
    const pizza = repo.createEntry({
      foodName: 'Pizza',
      mealType: 'dinner',
      mealTime: '2026-05-05T19:00:00.000Z',
    })
    repo.createEntry({
      foodName: 'Pizza Hut',
      mealType: 'lunch',
      mealTime: '2026-05-06T12:00:00.000Z',
      confirmedGroupFoodId: pizza.foodId,
    })
    repo.createEntry({
      foodName: 'Burger',
      mealType: 'dinner',
      mealTime: '2026-05-07T19:00:00.000Z',
    })
    repo.createEntry({
      foodName: 'Pizza',
      mealType: 'snack',
      mealTime: '2026-05-20T15:00:00.000Z',
    })

    const week = repo.getAnalytics({ date: '2026-05-06', period: 'week' })
    const month = repo.getAnalytics({ date: '2026-05-06', period: 'month' })

    expect(week.startDate).toBe('2026-05-04')
    expect(week.endDate).toBe('2026-05-10')
    expect(week.mostEatenFoods).toEqual([
      { foodId: pizza.foodId, name: 'Pizza', count: 2 },
      { foodId: expect.any(String), name: 'Burger', count: 1 },
    ])

    expect(month.startDate).toBe('2026-05-01')
    expect(month.endDate).toBe('2026-05-31')
    expect(month.mostEatenFoods[0]).toEqual({
      foodId: pizza.foodId,
      name: 'Pizza',
      count: 3,
    })
  })
})
