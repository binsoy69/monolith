import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/lib/db/schema";
import path from "path";

// Use in-memory DB for tests
export function createTestDb() {
  const sqlite = new Database(":memory:");
  const db = drizzle(sqlite, { schema });

  // Run migrations
  // Note: better-sqlite3 in-memory needs migrations to run to create tables
  // We can use drizzle-kit push or Programmatic API if available,
  // or manually execute SQL from migration files if needed.
  // For simplicity in this environment, let's try pushing schema directly or using `migrate`.
  // `migrate` reads from a folder. We need to point to our migrations folder.

  // Assuming migrations are in 'src/lib/db/migrations' folder
  const migrationsFolder = path.join(process.cwd(), "src/lib/db/migrations");
  migrate(db, { migrationsFolder });

  return { db, sqlite };
}
