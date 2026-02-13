import { db } from "@/lib/db";
import { journalEntries, journalTags } from "@/lib/db/schema";
import { eq, and, gte, lte, desc, asc, isNull, sql, inArray } from "drizzle-orm";

// --- Types ---

export type JournalEntry = typeof journalEntries.$inferSelect;
export type JournalTag = typeof journalTags.$inferSelect;

export interface JournalEntryWithTags extends JournalEntry {
  tags: string[];
}

export interface CreateEntryInput {
  title?: string;
  content?: string;
  mood?: string;
  entryDate: string;
  tags?: string[];
  frontMatter?: Record<string, unknown>;
}

// --- FTS5 Setup ---

let ftsInitialized = false;

interface SqliteExecClient {
  exec: (query: string) => void;
}

interface SqlitePreparedStatement {
  all: (...params: unknown[]) => unknown[];
}

interface SqliteFtsClient extends SqliteExecClient {
  prepare: (query: string) => SqlitePreparedStatement;
}

function getSessionClient(): unknown {
  return (db as unknown as { session?: { client?: unknown } }).session?.client;
}

function isSqliteExecClient(client: unknown): client is SqliteExecClient {
  return (
    typeof client === "object" &&
    client !== null &&
    "exec" in client &&
    typeof client.exec === "function"
  );
}

function isSqliteFtsClient(client: unknown): client is SqliteFtsClient {
  return (
    isSqliteExecClient(client) &&
    "prepare" in client &&
    typeof client.prepare === "function"
  );
}

async function ensureFts(): Promise<void> {
  if (ftsInitialized) return;
  try {
    const sqliteDb = getSessionClient();
    if (isSqliteExecClient(sqliteDb)) {
      sqliteDb.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS journal_fts USING fts5(
          title, content, entry_id UNINDEXED
        );
      `);
    }
    ftsInitialized = true;
  } catch (e) {
    console.error("Failed to init FTS5:", e);
  }
}

// --- Service ---

export const journalService = {
  async getEntries(opts?: {
    page?: number;
    limit?: number;
    mood?: string;
    tag?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ entries: JournalEntryWithTags[]; total: number }> {
    const page = opts?.page ?? 1;
    const limit = opts?.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [isNull(journalEntries.deletedAt)];
    if (opts?.mood) conditions.push(eq(journalEntries.mood, opts.mood));
    if (opts?.startDate) conditions.push(gte(journalEntries.entryDate, opts.startDate));
    if (opts?.endDate) conditions.push(lte(journalEntries.entryDate, opts.endDate));

    let entryIds: number[] | undefined;
    if (opts?.tag) {
      const tagRows = await db
        .select({ entryId: journalTags.entryId })
        .from(journalTags)
        .where(eq(journalTags.tag, opts.tag));
      entryIds = tagRows.map((r) => r.entryId);
      if (entryIds.length === 0) return { entries: [], total: 0 };
      conditions.push(inArray(journalEntries.id, entryIds));
    }

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(journalEntries)
      .where(and(...conditions));

    const entries = await db
      .select()
      .from(journalEntries)
      .where(and(...conditions))
      .orderBy(desc(journalEntries.entryDate))
      .limit(limit)
      .offset(offset);

    const entriesWithTags = await Promise.all(
      entries.map(async (entry) => {
        const tags = await db
          .select()
          .from(journalTags)
          .where(eq(journalTags.entryId, entry.id));
        return { ...entry, tags: tags.map((t) => t.tag) };
      }),
    );

    return { entries: entriesWithTags, total: totalResult[0]?.count ?? 0 };
  },

  async getEntry(id: number): Promise<JournalEntryWithTags | null> {
    const result = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), isNull(journalEntries.deletedAt)))
      .limit(1);
    if (!result[0]) return null;

    const tags = await db
      .select()
      .from(journalTags)
      .where(eq(journalTags.entryId, id));

    return { ...result[0], tags: tags.map((t) => t.tag) };
  },

  async createEntry(data: CreateEntryInput): Promise<JournalEntryWithTags> {
    const result = await db
      .insert(journalEntries)
      .values({
        title: data.title,
        content: data.content,
        mood: data.mood,
        entryDate: data.entryDate,
        frontMatter: data.frontMatter,
      })
      .returning();

    const entry = result[0];

    if (data.tags?.length) {
      await this.setTags(entry.id, data.tags);
    }

    await this.syncFtsEntry(entry.id);

    return { ...entry, tags: data.tags ?? [] };
  },

  async updateEntry(
    id: number,
    data: Partial<CreateEntryInput>,
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.mood !== undefined) updateData.mood = data.mood;
    if (data.entryDate !== undefined) updateData.entryDate = data.entryDate;
    if (data.frontMatter !== undefined) updateData.frontMatter = data.frontMatter;

    await db
      .update(journalEntries)
      .set(updateData)
      .where(eq(journalEntries.id, id));

    if (data.tags !== undefined) {
      await this.setTags(id, data.tags);
    }

    await this.syncFtsEntry(id);
  },

  async deleteEntry(id: number): Promise<void> {
    await db
      .update(journalEntries)
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(journalEntries.id, id));
    await this.removeFtsEntry(id);
  },

  // --- Tags ---

  async setTags(entryId: number, tags: string[]): Promise<void> {
    await db.delete(journalTags).where(eq(journalTags.entryId, entryId));
    if (tags.length > 0) {
      await db.insert(journalTags).values(
        tags.map((tag) => ({ entryId, tag })),
      );
    }
  },

  async getAllTags(): Promise<string[]> {
    const result = await db
      .selectDistinct({ tag: journalTags.tag })
      .from(journalTags)
      .orderBy(asc(journalTags.tag));
    return result.map((r) => r.tag);
  },

  // --- FTS5 ---

  async syncFtsEntry(id: number): Promise<void> {
    await ensureFts();
    try {
      const sqliteDb = getSessionClient();
      if (!isSqliteExecClient(sqliteDb)) return;

      const entry = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, id))
        .limit(1);
      if (!entry[0]) return;

      // Remove old entry first
      sqliteDb.exec(`DELETE FROM journal_fts WHERE entry_id = ${id}`);

      // Insert new
      const title = (entry[0].title ?? "").replace(/'/g, "''");
      const content = (entry[0].content ?? "").replace(/'/g, "''");
      sqliteDb.exec(
        `INSERT INTO journal_fts(title, content, entry_id) VALUES ('${title}', '${content}', ${id})`,
      );
    } catch (e) {
      console.error("FTS sync error:", e);
    }
  },

  async removeFtsEntry(id: number): Promise<void> {
    await ensureFts();
    try {
      const sqliteDb = getSessionClient();
      if (isSqliteExecClient(sqliteDb)) {
        sqliteDb.exec(`DELETE FROM journal_fts WHERE entry_id = ${id}`);
      }
    } catch (e) {
      console.error("FTS remove error:", e);
    }
  },

  async searchEntries(
    query: string,
    limit: number = 20,
  ): Promise<JournalEntryWithTags[]> {
    await ensureFts();
    try {
      const sqliteDb = getSessionClient();
      if (!isSqliteFtsClient(sqliteDb)) return [];

      const safeQuery = query.replace(/['"]/g, "").trim();
      if (!safeQuery) return [];

      const stmt = sqliteDb.prepare(`
        SELECT journal_fts.entry_id as id FROM journal_fts
        WHERE journal_fts MATCH ?
        ORDER BY rank
        LIMIT ?
      `);
      const ftsResults = stmt.all(safeQuery, limit) as { id: number }[];

      if (ftsResults.length === 0) return [];

      const entries: JournalEntryWithTags[] = [];
      for (const row of ftsResults) {
        const entry = await this.getEntry(row.id);
        if (entry) entries.push(entry);
      }
      return entries;
    } catch {
      // Fallback to LIKE search
      const entries = await db
        .select()
        .from(journalEntries)
        .where(
          and(
            isNull(journalEntries.deletedAt),
            sql`(${journalEntries.title} LIKE ${'%' + query + '%'} OR ${journalEntries.content} LIKE ${'%' + query + '%'})`,
          ),
        )
        .orderBy(desc(journalEntries.entryDate))
        .limit(limit);

      return Promise.all(
        entries.map(async (e) => {
          const tags = await db
            .select()
            .from(journalTags)
            .where(eq(journalTags.entryId, e.id));
          return { ...e, tags: tags.map((t) => t.tag) };
        }),
      );
    }
  },

  // --- Front matter ---

  parseFrontMatter(content: string): {
    frontMatter: Record<string, string>;
    body: string;
  } {
    const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) return { frontMatter: {}, body: content };

    const yamlStr = match[1];
    const body = match[2];
    const frontMatter: Record<string, string> = {};

    for (const line of yamlStr.split("\n")) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim();
        frontMatter[key] = value;
      }
    }

    return { frontMatter, body };
  },

  serializeFrontMatter(
    frontMatter: Record<string, string>,
    body: string,
  ): string {
    const entries = Object.entries(frontMatter);
    if (entries.length === 0) return body;

    const yaml = entries.map(([k, v]) => `${k}: ${v}`).join("\n");
    return `---\n${yaml}\n---\n${body}`;
  },
};
