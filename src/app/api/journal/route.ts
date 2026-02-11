import { NextResponse } from "next/server";
import { journalService } from "@/lib/services/journal.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const mood = searchParams.get("mood") ?? undefined;
    const tag = searchParams.get("tag") ?? undefined;
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;

    const result = await journalService.getEntries({
      page, limit, mood, tag, startDate, endDate,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to get journal entries:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, mood, entryDate, tags, frontMatter } = body;

    if (!entryDate || typeof entryDate !== "string") {
      return NextResponse.json({ error: "Entry date is required" }, { status: 400 });
    }

    const entry = await journalService.createEntry({
      title, content, mood, entryDate, tags, frontMatter,
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Failed to create journal entry:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
