import { NextResponse } from "next/server";
import { habitsService } from "@/lib/services/habits.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; date: string }> },
) {
  try {
    const { id, date } = await params;
    await habitsService.unlogHabit(parseInt(id), date);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unlog habit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
