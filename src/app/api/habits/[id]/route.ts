import { NextResponse } from "next/server";
import { habitsService } from "@/lib/services/habits.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const habit = await habitsService.getHabit(parseInt(id));
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }
    return NextResponse.json(habit);
  } catch (error) {
    console.error("Failed to get habit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await habitsService.updateHabit(parseInt(id), body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update habit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      await habitsService.deleteHabit(parseInt(id));
    } else {
      await habitsService.archiveHabit(parseInt(id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete habit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
