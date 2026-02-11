import { NextResponse } from "next/server";
import { getDataDir } from "@/lib/utils/paths";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: segments } = await params;
    const dataDir = getDataDir();
    const filePath = path.join(dataDir, "images", ...segments);

    // Security: prevent path traversal
    const resolved = path.resolve(filePath);
    const imagesRoot = path.resolve(path.join(dataDir, "images"));
    if (!resolved.startsWith(imagesRoot)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
