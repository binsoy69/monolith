import Database from 'better-sqlite3'
import type { SearchResult } from '../../shared/ipc-types'

interface HabitSearchRow {
  id: string
  name: string
}

interface TaskSearchRow {
  id: string
  title: string
  notes: string | null
  date: string
}

interface ExpenseSearchRow {
  id: string
  title: string
  snippet: string
  date: string
}

interface DailyNoteSearchRow {
  date: string
  content: string
}

interface FoodSearchRow {
  id: string
  name: string
  lastDate: string | null
}

interface MealEntrySearchRow {
  id: string
  foodName: string
  notes: string | null
  date: string
}

function getSearchScore(title: string, snippet: string | null, query: string): number {
  const normalizedTitle = title.toLowerCase()
  const normalizedSnippet = (snippet ?? '').toLowerCase()

  if (normalizedTitle.startsWith(query)) {
    return 0
  }

  if (normalizedTitle.includes(query)) {
    return 1
  }

  if (normalizedSnippet.includes(query)) {
    return 2
  }

  return 2
}

function compareResults(left: SearchResult, right: SearchResult, query: string): number {
  const scoreDiff =
    getSearchScore(left.title, left.snippet, query) - getSearchScore(right.title, right.snippet, query)
  if (scoreDiff !== 0) {
    return scoreDiff
  }

  if (left.date !== right.date) {
    if (left.date === null) return 1
    if (right.date === null) return -1
    return right.date.localeCompare(left.date)
  }

  return left.title.localeCompare(right.title)
}

function buildDailyNoteSnippet(content: string, query: string): string {
  const normalizedContent = content.replace(/\s+/g, ' ').trim()
  const matchIndex = normalizedContent.toLowerCase().indexOf(query)
  if (matchIndex === -1) {
    return normalizedContent.slice(0, 90)
  }

  const desiredLength = 90
  const halfWindow = Math.floor(desiredLength / 2)
  let start = Math.max(0, matchIndex - halfWindow)
  let end = Math.min(normalizedContent.length, start + desiredLength)

  if (end - start < desiredLength) {
    start = Math.max(0, end - desiredLength)
  }

  const prefix = start > 0 ? '…' : ''
  const suffix = end < normalizedContent.length ? '…' : ''
  return `${prefix}${normalizedContent.slice(start, end).trim()}${suffix}`
}

export class SearchRepository {
  constructor(private readonly db: Database.Database) {}

  private hasTable(tableName: string): boolean {
    const row = this.db
      .prepare('SELECT 1 FROM sqlite_master WHERE type = ? AND name = ? LIMIT 1')
      .get('table', tableName) as { 1: number } | undefined
    return row !== undefined
  }

  query(query: string, limit = 8): SearchResult[] {
    const normalizedQuery = query.trim().toLowerCase()
    if (normalizedQuery.length === 0) {
      return []
    }

    const likeQuery = `%${normalizedQuery}%`

    const habits = (
      this.db
        .prepare(
          `SELECT id, name
           FROM habits
           WHERE archived = 0 AND LOWER(habits.name) LIKE ?
           ORDER BY name COLLATE NOCASE ASC
           LIMIT ?`
        )
        .all(likeQuery, limit) as HabitSearchRow[]
    ).map(
      (row): SearchResult => ({
        type: 'habit',
        id: row.id,
        title: row.name,
        subtitle: 'Habit',
        snippet: null,
        date: null,
      })
    )

    const tasks = (
      this.db
        .prepare(
          `SELECT id, title, notes, date
           FROM tasks
           WHERE LOWER(tasks.title) LIKE ?
             OR LOWER(COALESCE(tasks.notes, '')) LIKE ?
           ORDER BY date DESC, created_at DESC
           LIMIT ?`
        )
        .all(likeQuery, likeQuery, limit) as TaskSearchRow[]
    ).map(
      (row): SearchResult => ({
        type: 'task',
        id: row.id,
        title: row.title,
        subtitle: 'Task',
        snippet: row.notes,
        date: row.date,
      })
    )

    const expenses = (
      this.db
        .prepare(
          `SELECT
             expenses.id AS id,
             COALESCE(NULLIF(expenses.notes, ''), categories.name) AS title,
             categories.name AS snippet,
             expenses.date AS date
           FROM expenses
           JOIN categories ON categories.id = expenses.category_id
           LEFT JOIN wallets ON wallets.id = expenses.wallet_id
           WHERE LOWER(COALESCE(expenses.notes, '')) LIKE ?
             OR LOWER(categories.name) LIKE ?
             OR LOWER(COALESCE(wallets.name, '')) LIKE ?
           ORDER BY expenses.date DESC, expenses.created_at DESC
           LIMIT ?`
        )
        .all(likeQuery, likeQuery, likeQuery, limit) as ExpenseSearchRow[]
    ).map(
      (row): SearchResult => ({
        type: 'expense',
        id: row.id,
        title: row.title,
        subtitle: 'Expense',
        snippet: row.snippet,
        date: row.date,
      })
    )

    const dailyNotes = (
      this.db
        .prepare(
          `SELECT date, content
           FROM daily_notes
           WHERE LOWER(daily_notes.content) LIKE ?
           ORDER BY date DESC
           LIMIT ?`
        )
        .all(likeQuery, limit) as DailyNoteSearchRow[]
    ).map(
      (row): SearchResult => ({
        type: 'daily_note',
        id: row.date,
        title: 'Daily note',
        subtitle: 'Notes',
        snippet: buildDailyNoteSnippet(row.content, normalizedQuery),
        date: row.date,
      })
    )

    const foodResults: SearchResult[] = this.hasTable('foods')
      ? (
          this.db
            .prepare(
              `SELECT
                 f.id AS id,
                 f.name AS name,
                 MAX(m.date) AS lastDate
               FROM foods f
               LEFT JOIN meal_entries m ON m.food_id = f.id
               WHERE LOWER(f.name) LIKE ?
                 OR LOWER(f.normalized_name) LIKE ?
               GROUP BY f.id
               ORDER BY lastDate DESC, f.name COLLATE NOCASE ASC
               LIMIT ?`
            )
            .all(likeQuery, likeQuery, limit) as FoodSearchRow[]
        ).map((row): SearchResult => ({
          type: 'food',
          id: row.id,
          title: row.name,
          subtitle: 'Food',
          snippet: null,
          date: row.lastDate,
        }))
      : []

    const mealEntryResults: SearchResult[] = this.hasTable('meal_entries')
      ? (
          this.db
            .prepare(
              `SELECT id, food_name AS foodName, notes, date
               FROM meal_entries
               WHERE LOWER(food_name) LIKE ?
                 OR LOWER(COALESCE(notes, '')) LIKE ?
               ORDER BY date DESC, meal_time DESC
               LIMIT ?`
            )
            .all(likeQuery, likeQuery, limit) as MealEntrySearchRow[]
        ).map((row): SearchResult => ({
          type: 'food_entry',
          id: row.id,
          title: row.foodName,
          subtitle: 'Meal',
          snippet: row.notes,
          date: row.date,
        }))
      : []

    return [...habits, ...tasks, ...expenses, ...dailyNotes, ...foodResults, ...mealEntryResults]
      .sort((left, right) => compareResults(left, right, normalizedQuery))
      .slice(0, limit)
  }
}
