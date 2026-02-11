import { defineConfig } from "drizzle-kit";

// Note: This config is for the CLI. The runtime path resolution logic
// in src/lib/db/index.ts handles the actual app DB connection.
// For CLI migrations, we'll use a default local path or env var if needed.

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_URL || "monolith.db",
  },
  verbose: true,
  strict: true,
});
