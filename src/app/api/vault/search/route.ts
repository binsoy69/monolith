import { NextResponse } from "next/server";
import { vaultService } from "@/lib/services/vault.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    if (!q || !q.trim()) {
      return NextResponse.json([]);
    }

    const results = await vaultService.searchFiles(q.trim());
    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to search vault:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
