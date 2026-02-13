import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { habits, journalEntries, transactions, tasks } from "@/lib/db/schema";
import { like, isNull, and, sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SearchResult {
  type: "habit" | "journal" | "transaction" | "task" | "page";
  title: string;
  id?: number;
  url: string;
  subtitle?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const pattern = `%${q}%`;
    const results: SearchResult[] = [];

    // Search habits
    const habitResults = await db
      .select({ id: habits.id, name: habits.name })
      .from(habits)
      .where(
        and(
          like(habits.name, pattern),
          isNull(sql`CASE WHEN ${habits.isArchived} THEN 1 ELSE NULL END`),
        ),
      )
      .limit(5);

    for (const h of habitResults) {
      results.push({
        type: "habit",
        title: h.name,
        id: h.id,
        url: `/habits/${h.id}`,
      });
    }

    // Search journal entries
    const journalResults = await db
      .select({
        id: journalEntries.id,
        title: journalEntries.title,
        entryDate: journalEntries.entryDate,
      })
      .from(journalEntries)
      .where(
        and(
          isNull(journalEntries.deletedAt),
          like(journalEntries.title, pattern),
        ),
      )
      .limit(5);

    for (const j of journalResults) {
      results.push({
        type: "journal",
        title: j.title || "Untitled",
        id: j.id,
        url: `/journal/${j.id}`,
        subtitle: j.entryDate,
      });
    }

    // Search transactions
    const txResults = await db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        type: transactions.type,
      })
      .from(transactions)
      .where(like(transactions.description, pattern))
      .limit(5);

    for (const t of txResults) {
      results.push({
        type: "transaction",
        title: t.description || "Transaction",
        id: t.id,
        url: `/finance/transactions`,
        subtitle: `${t.type} — ₱${(t.amount / 100).toLocaleString()}`,
      });
    }

    // Search tasks
    const taskResults = await db
      .select({ id: tasks.id, title: tasks.title })
      .from(tasks)
      .where(like(tasks.title, pattern))
      .limit(5);

    for (const t of taskResults) {
      results.push({
        type: "task",
        title: t.title,
        id: t.id,
        url: `/tasks`,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
