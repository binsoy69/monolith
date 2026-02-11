import { NextResponse } from "next/server";
import { habitsService } from "@/lib/services/habits.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const includeArchived = searchParams.get("includeArchived") === "true";
    const date = searchParams.get("date") ?? undefined;

    const habits = await habitsService.getHabits({
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      includeArchived,
      date,
    });

    return NextResponse.json(habits);
  } catch (error) {
    console.error("Failed to get habits:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, categoryId, frequency, frequencyValue, targetDays, reminderTime } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!frequency || !["daily", "weekly", "monthly", "every_n_days"].includes(frequency)) {
      return NextResponse.json({ error: "Valid frequency is required" }, { status: 400 });
    }

    const habit = await habitsService.createHabit({
      name: name.trim(),
      description,
      categoryId,
      frequency,
      frequencyValue,
      targetDays,
      reminderTime,
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error("Failed to create habit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
