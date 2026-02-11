import { NextResponse } from "next/server";
import { settingsService } from "@/lib/services/settings.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await settingsService.getAllSettings();
  return NextResponse.json(settings);
}

async function updateSetting(request: Request) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (typeof key !== "string" || key.trim().length === 0) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    if (typeof value !== "string") {
      return NextResponse.json(
        { error: "Invalid value" },
        { status: 400 },
      );
    }

    await settingsService.setSetting(key.trim(), value);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update setting:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  return updateSetting(request);
}

// Keep POST for compatibility with existing clients.
export async function POST(request: Request) {
  return updateSetting(request);
}
