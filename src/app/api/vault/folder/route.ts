import { NextResponse } from "next/server";
import { vaultService } from "@/lib/services/vault.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path: folderPath } = body;
    if (!folderPath) {
      return NextResponse.json({ error: "Path required" }, { status: 400 });
    }

    await vaultService.createFolder(folderPath);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Path traversal detected") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Failed to create folder:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
