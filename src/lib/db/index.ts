import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { getDbPath } from "@/lib/utils/paths";

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  var __monolithDb: DbClient | undefined;
}

export function getDb() {
  if (globalThis.__monolithDb) return globalThis.__monolithDb;

  const dbPath = getDbPath();
  const sqlite = new Database(dbPath);

  // Performance and integrity settings
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const instance = drizzle(sqlite, { schema });
  globalThis.__monolithDb = instance;
  return instance;
}

// Export a singleton instance for default usage
export const db = getDb();
