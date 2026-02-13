import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { journalEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { decrypt, type EncryptedData } from "@/lib/utils/crypto";

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

    if (!entry.contentEncrypted) {
      return NextResponse.json(
        { error: "Entry is not encrypted" },
        { status: 400 },
      );
    }

    try {
      const encrypted: EncryptedData = JSON.parse(entry.content || "");
      const plaintext = decrypt(encrypted, password);
      return NextResponse.json({ content: plaintext });
    } catch {
      return NextResponse.json(
        { error: "Wrong password or corrupted data" },
        { status: 403 },
      );
    }
  } catch (error) {
    console.error("Failed to decrypt entry:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
