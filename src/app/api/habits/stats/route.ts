import { NextResponse } from "next/server";
import { habitsService } from "@/lib/services/habits.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const habits = await habitsService.getHabits();
    const stats = habits.map((h) => ({
      habitId: h.id,
      name: h.name,
      ...h.stats,
    }));
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to get habit stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
