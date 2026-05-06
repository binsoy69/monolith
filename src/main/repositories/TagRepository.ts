import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'
import type { Tag, TaggableItemType, TaggedItemSummary } from '../../shared/domain-types'

interface TagRow {
  id: string
  name: string
  color: string
  created_at: string
}

interface TaggedItemRow {
  itemId: string
  title: string
  subtitle: string
  date: string | null
}

const TAG_PALETTE = ['#5b8def', '#4fbf8f', '#d6a84f', '#c16e70', '#8b7cf6', '#59a6b0', '#d18452', '#7f8796']

function mapTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
  }
}

function compareTaggedItems(left: TaggedItemSummary, right: TaggedItemSummary): number {
  if (left.date === right.date) {
    return left.title.localeCompare(right.title)
  }

  if (left.date === null) {
    return 1
  }

  if (right.date === null) {
    return -1
  }

  return right.date.localeCompare(left.date) || left.title.localeCompare(right.title)
}

export class TagRepository {
  constructor(private readonly db: Database.Database) {}

  private hasTable(tableName: string): boolean {
    const row = this.db
      .prepare('SELECT 1 FROM sqlite_master WHERE type = ? AND name = ? LIMIT 1')
      .get('table', tableName) as { 1: number } | undefined
    return row !== undefined
  }

  list(): Tag[] {
    const rows = this.db
      .prepare('SELECT id, name, color, created_at FROM tags ORDER BY name COLLATE NOCASE ASC')
      .all() as TagRow[]
    return rows.map(mapTag)
  }

  create(data: { name: string }): Tag {
    const name = data.name.trim()
    if (name.length === 0) {
      throw new Error('Tag name is required.')
    }

    const id = randomUUID()
    const createdAt = new Date().toISOString()
    const countRow = this.db.prepare('SELECT COUNT(*) as count FROM tags').get() as { count: number }
    const color = TAG_PALETTE[countRow.count % TAG_PALETTE.length]

    try {
      this.db
        .prepare('INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)')
        .run(id, name, color, createdAt)
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE')) {
        throw new Error('Tag name must be unique.')
      }

      throw error
    }

    return { id, name, color, createdAt }
  }

  listForItem(itemType: TaggableItemType, itemId: string): Tag[] {
    const rows = this.db
      .prepare(
        `SELECT t.id, t.name, t.color, t.created_at
         FROM tags t
         JOIN item_tags it ON it.tag_id = t.id
         WHERE it.item_type = ? AND it.item_id = ?
         ORDER BY t.name COLLATE NOCASE ASC`
      )
      .all(itemType, itemId) as TagRow[]

    return rows.map(mapTag)
  }

  setAssignment(tagId: string, itemType: TaggableItemType, itemId: string, assigned: boolean): void {
    if (assigned) {
      this.db
        .prepare(
          `INSERT INTO item_tags (tag_id, item_type, item_id, created_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(tag_id, item_type, item_id) DO NOTHING`
        )
        .run(tagId, itemType, itemId, new Date().toISOString())
      return
    }

    this.db.prepare('DELETE FROM item_tags WHERE tag_id = ? AND item_type = ? AND item_id = ?').run(tagId, itemType, itemId)
  }

  listItemsByTag(tagId: string): TaggedItemSummary[] {
    const habits = (
      this.db
        .prepare(
          `SELECT h.id as itemId, h.name as title, 'Habit' as subtitle, NULL as date
           FROM item_tags it
           JOIN habits h ON h.id = it.item_id
           WHERE it.tag_id = ? AND it.item_type = 'habit'`
        )
        .all(tagId) as TaggedItemRow[]
    ).map((row) => ({
      itemType: 'habit' as const,
      itemId: row.itemId,
      title: row.title,
      subtitle: row.subtitle,
      date: row.date,
    }))

    const tasks = (
      this.db
        .prepare(
          `SELECT t.id as itemId, t.title as title, 'Task' as subtitle, t.date as date
           FROM item_tags it
           JOIN tasks t ON t.id = it.item_id
           WHERE it.tag_id = ? AND it.item_type = 'task'`
        )
        .all(tagId) as TaggedItemRow[]
    ).map((row) => ({
      itemType: 'task' as const,
      itemId: row.itemId,
      title: row.title,
      subtitle: row.subtitle,
      date: row.date,
    }))

    const expenses = (
      this.db
        .prepare(
          `SELECT
             e.id as itemId,
             COALESCE(NULLIF(e.notes, ''), c.name) as title,
             'Expense' as subtitle,
             e.date as date
           FROM item_tags it
           JOIN expenses e ON e.id = it.item_id
           JOIN categories c ON c.id = e.category_id
           WHERE it.tag_id = ? AND it.item_type = 'expense'`
        )
        .all(tagId) as TaggedItemRow[]
    ).map((row) => ({
      itemType: 'expense' as const,
      itemId: row.itemId,
      title: row.title,
      subtitle: row.subtitle,
      date: row.date,
    }))

    const foodEntries = this.hasTable('meal_entries')
      ? (
          this.db
            .prepare(
              `SELECT
                 m.id as itemId,
                 m.food_name as title,
                 'Meal' as subtitle,
                 m.date as date
               FROM item_tags it
               JOIN meal_entries m ON m.id = it.item_id
               WHERE it.tag_id = ? AND it.item_type = 'food_entry'`
            )
            .all(tagId) as TaggedItemRow[]
        ).map((row) => ({
          itemType: 'food_entry' as const,
          itemId: row.itemId,
          title: row.title,
          subtitle: row.subtitle,
          date: row.date,
        }))
      : []

    return [...habits, ...tasks, ...expenses, ...foodEntries].sort(compareTaggedItems)
  }
}
