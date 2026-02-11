import { NextResponse } from "next/server";
import { getDataDir } from "@/lib/utils/paths";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const entryId = formData.get("entryId") as string | null;

    if (!file || !entryId) {
      return NextResponse.json({ error: "File and entryId are required" }, { status: 400 });
    }

    const dataDir = getDataDir();
    const imageDir = path.join(dataDir, "images", "journal", entryId);
    await fs.mkdir(imageDir, { recursive: true });

    // Sanitize filename
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = path.join(imageDir, safeName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const relativePath = `/api/images/journal/${entryId}/${safeName}`;
    return NextResponse.json({ path: relativePath });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
