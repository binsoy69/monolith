import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { journalEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { encrypt } from "@/lib/utils/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.id, parseInt(id)));

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    if (entry.contentEncrypted) {
      return NextResponse.json(
        { error: "Entry is already encrypted" },
        { status: 400 },
      );
    }

    const encrypted = encrypt(entry.content || "", password);

    await db
      .update(journalEntries)
      .set({
        content: JSON.stringify(encrypted),
        contentEncrypted: true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(journalEntries.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to encrypt entry:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
