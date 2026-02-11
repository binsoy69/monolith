import { NextResponse } from "next/server";
import { habitsService } from "@/lib/services/habits.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { date, note } = body;

    if (!date || typeof date !== "string") {
      return NextResponse.json({ error: "Date is required (YYYY-MM-DD)" }, { status: 400 });
    }

    await habitsService.logHabit(parseInt(id), date, note);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log habit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
