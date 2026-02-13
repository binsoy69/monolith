import { NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { gunzipSync } from "zlib";
import { getDbPath } from "@/lib/utils/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Backup file is required" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Decompress gzip
    let dbData: Buffer;
    try {
      dbData = gunzipSync(buffer);
    } catch {
      return NextResponse.json(
        { error: "Invalid backup file — could not decompress" },
        { status: 400 },
      );
    }

    // Validate SQLite header
    const header = dbData.subarray(0, 16).toString("ascii");
    if (!header.startsWith("SQLite format 3")) {
      return NextResponse.json(
        { error: "Invalid backup file — not a valid SQLite database" },
        { status: 400 },
      );
    }

    // Close existing connection and write new db
    const dbPath = getDbPath();

    // Clear the global db instance so it gets re-created
    globalThis.__monolithDb = undefined;

    writeFileSync(dbPath, dbData);

    return NextResponse.json({
      success: true,
      message: "Backup restored successfully. Please refresh the page.",
    });
  } catch (error) {
    console.error("Backup import failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
