// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Database from 'better-sqlite3'
import { getDashboardData } from '../src/main/ipc/dashboard'
import { SearchRepository } from '../src/main/repositories/SearchRepository'
import { TagRepository } from '../src/main/repositories/TagRepository'
import { useFoodStore } from '../src/renderer/food/food-store'
import type { SearchResult } from '../src/shared/ipc-types'

vi.mock('@phosphor-icons/react', () => {
  const Icon = () => null
  return {
    Checks: Icon,
    ForkKnife: Icon,
    Pulse: Icon,
    SlidersHorizontal: Icon,
    SquaresFour: Icon,
    Wallet: Icon,
  }
})

vi.mock('../src/renderer/shell/WindowChrome', () => ({
  WindowChrome: () => null,
}))

import { handleSearchSelect } from '../src/renderer/App'

function createTestDb(): Database.Database {
  const db = new Database(':memory:')
  db.exec(`
    CREATE TABLE habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      days_of_week TEXT NOT NULL DEFAULT '1111111',
      kind TEXT NOT NULL DEFAULT 'boolean',
      target_count INTEGER NOT NULL DEFAULT 1,
      archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE habit_completions (
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      value INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (habit_id, date)
    );
    CREATE TABLE tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      notes TEXT,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      carried_from_date TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      priority INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE categories (id TEXT PRIMARY KEY, name TEXT NOT NULL, color TEXT);
    CREATE TABLE wallets (id TEXT PRIMARY KEY, name TEXT NOT NULL, balance INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE expenses (
      id TEXT PRIMARY KEY,
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      category_id TEXT NOT NULL,
      wallet_id TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE daily_notes (
      date TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE foods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL UNIQUE,
      group_food_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE meal_entries (
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
    CREATE TABLE tags (id TEXT PRIMARY KEY, name TEXT NOT NULL, color TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE item_tags (
      tag_id TEXT NOT NULL,
      item_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (tag_id, item_type, item_id)
    );
  `)
  return db
}

describe('Food dashboard, search, and tags integration', () => {
  let db: Database.Database

  beforeEach(() => {
    db = createTestDb()
    db.prepare(
      'INSERT INTO foods (id, name, normalized_name, group_food_id, created_at, updated_at) VALUES (?, ?, ?, NULL, ?, ?)'
    ).run('food-pizza', 'Pizza', 'pizza', '2026-05-01T00:00:00.000Z', '2026-05-01T00:00:00.000Z')
    db.prepare(
      'INSERT INTO meal_entries (id, food_id, food_name, meal_type, meal_time, date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      'meal-1',
      'food-pizza',
      'Pizza',
      'lunch',
      '2026-05-06T12:00:00.000Z',
      '2026-05-06',
      'Two slices',
      '2026-05-06T12:00:00.000Z',
      '2026-05-06T12:00:00.000Z'
    )
  })

  it('aggregates dashboard food trends', () => {
    const result = getDashboardData(db, '2026-05-06')

    expect(result.food.mealsToday).toBe(1)
    expect(result.food.mostEatenThisWeek[0]).toEqual({
      foodId: 'food-pizza',
      name: 'Pizza',
      count: 1,
    })
    expect(result.food.mostEatenThisMonth[0].name).toBe('Pizza')
  })

  it('returns food search results from meal entries and foods', () => {
    const results = new SearchRepository(db).query('pizza', 8)

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'food', id: 'food-pizza', title: 'Pizza' }),
        expect.objectContaining({ type: 'food_entry', id: 'meal-1', subtitle: 'Meal' }),
      ])
    )
  })

  it('routes food search results to Food and surfaces the matching entry', () => {
    const setActiveModule = vi.fn()
    const setHighlightFoodEntryId = vi.fn()
    const setFoodFilters = vi.fn()
    const result: SearchResult = {
      type: 'food_entry',
      id: 'meal-1',
      title: 'Pizza',
      subtitle: 'Meal',
      snippet: null,
      date: '2026-05-06',
    }

    useFoodStore.setState({ setFilters: setFoodFilters })

    handleSearchSelect(
      result,
      setActiveModule,
      vi.fn(),
      vi.fn(),
      vi.fn(),
      setHighlightFoodEntryId
    )

    expect(setActiveModule).toHaveBeenCalledWith('food')
    expect(setFoodFilters).toHaveBeenCalledWith({ query: 'Pizza', foodId: undefined })
    expect(setHighlightFoodEntryId).toHaveBeenCalledWith('meal-1')
  })

  it('lists tagged food entries', () => {
    db.prepare('INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)')
      .run('tag-1', 'Comfort', '#5b8def', '2026-05-06T00:00:00.000Z')
    db.prepare('INSERT INTO item_tags (tag_id, item_type, item_id, created_at) VALUES (?, ?, ?, ?)')
      .run('tag-1', 'food_entry', 'meal-1', '2026-05-06T00:00:00.000Z')

    const items = new TagRepository(db).listItemsByTag('tag-1')

    expect(items).toEqual([
      {
        itemType: 'food_entry',
        itemId: 'meal-1',
        title: 'Pizza',
        subtitle: 'Meal',
        date: '2026-05-06',
      },
    ])
  })
})
