import { describe, it, expect, beforeEach, vi } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";

const sqlite = new Database(":memory:");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    content_encrypted INTEGER DEFAULT 0,
    mood TEXT,
    is_prompt INTEGER DEFAULT 0,
    prompt_text TEXT,
    front_matter TEXT,
    entry_date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TEXT
  );
  CREATE TABLE IF NOT EXISTS journal_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    tag TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS journal_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    alt_text TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
  );
`);

const testDb = drizzle(sqlite, { schema });

vi.mock("@/lib/db", () => ({
  db: testDb,
  getDb: () => testDb,
}));

const { journalService } = await import("../journal.service");

describe("journalService", () => {
  beforeEach(() => {
    sqlite.exec("DELETE FROM journal_tags");
    sqlite.exec("DELETE FROM journal_images");
    sqlite.exec("DELETE FROM journal_entries");
  });

  describe("CRUD", () => {
    it("should create an entry", async () => {
      const entry = await journalService.createEntry({
        title: "Test Entry",
        content: "Hello world",
        mood: "happy",
        entryDate: "2026-02-11 00:00:00",
        tags: ["test", "hello"],
      });
      expect(entry.title).toBe("Test Entry");
      expect(entry.tags).toEqual(["test", "hello"]);
    });

    it("should get entry by id", async () => {
      const created = await journalService.createEntry({
        title: "Find Me",
        entryDate: "2026-02-11 00:00:00",
      });
      const entry = await journalService.getEntry(created.id);
      expect(entry).not.toBeNull();
      expect(entry!.title).toBe("Find Me");
    });

    it("should soft delete an entry", async () => {
      const entry = await journalService.createEntry({
        title: "Delete Me",
        entryDate: "2026-02-11 00:00:00",
      });
      await journalService.deleteEntry(entry.id);
      const deleted = await journalService.getEntry(entry.id);
      expect(deleted).toBeNull();
    });

    it("should list entries with pagination", async () => {
      for (let i = 0; i < 5; i++) {
        await journalService.createEntry({
          title: `Entry ${i}`,
          entryDate: `2026-02-${String(i + 1).padStart(2, "0")} 00:00:00`,
        });
      }
      const result = await journalService.getEntries({ page: 1, limit: 3 });
      expect(result.entries.length).toBe(3);
      expect(result.total).toBe(5);
    });

    it("should filter by mood", async () => {
      await journalService.createEntry({
        title: "Happy",
        mood: "happy",
        entryDate: "2026-02-11 00:00:00",
      });
      await journalService.createEntry({
        title: "Sad",
        mood: "sad",
        entryDate: "2026-02-10 00:00:00",
      });
      const result = await journalService.getEntries({ mood: "happy" });
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].title).toBe("Happy");
    });

    it("should filter by tag", async () => {
      await journalService.createEntry({
        title: "Tagged",
        entryDate: "2026-02-11 00:00:00",
        tags: ["important"],
      });
      await journalService.createEntry({
        title: "Untagged",
        entryDate: "2026-02-10 00:00:00",
      });
      const result = await journalService.getEntries({ tag: "important" });
      expect(result.entries.length).toBe(1);
      expect(result.entries[0].title).toBe("Tagged");
    });
  });

  describe("tags", () => {
    it("should set and get tags", async () => {
      const entry = await journalService.createEntry({
        title: "Tags Test",
        entryDate: "2026-02-11 00:00:00",
        tags: ["a", "b"],
      });
      await journalService.setTags(entry.id, ["c", "d"]);
      const updated = await journalService.getEntry(entry.id);
      expect(updated!.tags).toEqual(["c", "d"]);
    });

    it("should get all distinct tags", async () => {
      await journalService.createEntry({
        title: "A",
        entryDate: "2026-02-11 00:00:00",
        tags: ["foo", "bar"],
      });
      await journalService.createEntry({
        title: "B",
        entryDate: "2026-02-10 00:00:00",
        tags: ["bar", "baz"],
      });
      const tags = await journalService.getAllTags();
      expect(tags).toEqual(["bar", "baz", "foo"]);
    });
  });

  describe("front matter", () => {
    it("should parse front matter", () => {
      const input = "---\nlocation: Home\nweather: Sunny\n---\nHello world";
      const result = journalService.parseFrontMatter(input);
      expect(result.frontMatter).toEqual({ location: "Home", weather: "Sunny" });
      expect(result.body).toBe("Hello world");
    });

    it("should return empty for no front matter", () => {
      const result = journalService.parseFrontMatter("Just text");
      expect(result.frontMatter).toEqual({});
      expect(result.body).toBe("Just text");
    });

    it("should serialize front matter", () => {
      const result = journalService.serializeFrontMatter(
        { location: "Home", weather: "Sunny" },
        "Hello world",
      );
      expect(result).toBe("---\nlocation: Home\nweather: Sunny\n---\nHello world");
    });

    it("should serialize empty front matter as just body", () => {
      const result = journalService.serializeFrontMatter({}, "Hello");
      expect(result).toBe("Hello");
    });
  });
});
