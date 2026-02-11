import { NextResponse } from "next/server";
import { journalService } from "@/lib/services/journal.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    if (!q || !q.trim()) {
      return NextResponse.json([]);
    }

    const results = await journalService.searchEntries(q.trim(), limit);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to search journal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
