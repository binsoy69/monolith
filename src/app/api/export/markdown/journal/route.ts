import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { journalEntries, journalTags } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entries = await db
      .select()
      .from(journalEntries)
      .where(isNull(journalEntries.deletedAt));

    const allTags = await db.select().from(journalTags);
    const tagsByEntry = new Map<number, string[]>();
    for (const t of allTags) {
      const arr = tagsByEntry.get(t.entryId) || [];
      arr.push(t.tag);
      tagsByEntry.set(t.entryId, arr);
    }

    // Build markdown files as a combined output
    // For simplicity without archiver, we'll return a single concatenated markdown
    // with clear separators
    let output = "";

    for (const entry of entries) {
      // YAML front matter
      output += "---\n";
      output += `title: "${(entry.title || "Untitled").replace(/"/g, '\\"')}"\n`;
      output += `date: ${entry.entryDate}\n`;
      if (entry.mood) output += `mood: ${entry.mood}\n`;
      const tags = tagsByEntry.get(entry.id) || [];
      if (tags.length > 0) {
        output += `tags: [${tags.map((t) => `"${t}"`).join(", ")}]\n`;
      }
      output += "---\n\n";

      // Content
      if (entry.contentEncrypted) {
        output += "*[Encrypted content — cannot export]*\n";
      } else {
        output += (entry.content || "") + "\n";
      }
      output += "\n---\n\n";
    }

    return new Response(output, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="journal-export-${new Date().toISOString().split("T")[0]}.md"`,
      },
    });
  } catch (error) {
    console.error("Journal export failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
