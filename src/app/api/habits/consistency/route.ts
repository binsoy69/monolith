import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { habitLogs } from "@/lib/db/schema";
import { gte, eq } from "drizzle-orm";
import { toISODate } from "@/lib/utils/dates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") ?? "365");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startStr = toISODate(startDate);

    const logs = await db
      .select({
        logDate: habitLogs.logDate,
        completed: habitLogs.completed,
      })
      .from(habitLogs)
      .where(gte(habitLogs.logDate, startStr));

    // Count completions per date
    const dateCounts: Record<string, number> = {};
    for (const log of logs) {
      if (log.completed) {
        dateCounts[log.logDate] = (dateCounts[log.logDate] ?? 0) + 1;
      }
    }

    // Get total active habits count for percentage calculation
    const { habits } = await import("@/lib/db/schema");
    const activeHabits = await db
      .select({ id: habits.id })
      .from(habits)
      .where(eq(habits.isArchived, false));

    return NextResponse.json({
      dateCounts,
      totalHabits: activeHabits.length,
    });
  } catch (error) {
    console.error("Failed to get consistency data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
