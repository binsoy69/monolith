import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { getDbPath } from "@/lib/utils/paths";
import { createGzip } from "zlib";
import { Readable } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const dbPath = getDbPath();

    // Read the SQLite database file
    const dbBuffer = readFileSync(dbPath);

    // Create a simple gzipped backup of the database
    const readable = Readable.from(dbBuffer);
    const gzip = createGzip();
    const chunks: Buffer[] = [];

    const compressed = await new Promise<Buffer>((resolve, reject) => {
      readable
        .pipe(gzip)
        .on("data", (chunk: Buffer) => chunks.push(chunk))
        .on("end", () => resolve(Buffer.concat(chunks)))
        .on("error", reject);
    });

    const date = new Date().toISOString().split("T")[0];

    return new Response(compressed as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="monolith-backup-${date}.db.gz"`,
      },
    });
  } catch (error) {
    console.error("Backup export failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
