import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import { migrations } from './migrations'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'monolith.db')
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    runMigrations(db)
  }
  return db
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}

function runMigrations(database: Database.Database): void {
  const currentVersion = database.pragma('user_version', { simple: true }) as number
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      database.exec(migration.sql)
      database.pragma(`user_version = ${migration.version}`)
    }
  }
}
