import { NextResponse } from "next/server";
import { vaultService } from "@/lib/services/vault.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tree = await vaultService.getTree();
    return NextResponse.json(tree);
  } catch (error) {
    console.error("Failed to get vault tree:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
