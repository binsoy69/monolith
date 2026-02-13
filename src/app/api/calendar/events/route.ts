import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { journalEntries, tasks, habitLogs, habits } from "@/lib/db/schema";
import { and, gte, lte, isNull } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "journal" | "task" | "habit";
  color: string;
  meta?: Record<string, unknown>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json(
        { error: "start and end query params required" },
        { status: 400 },
      );
    }

    const events: CalendarEvent[] = [];

    // Journal entries
    const journalRows = await db
      .select({
        id: journalEntries.id,
        title: journalEntries.title,
        entryDate: journalEntries.entryDate,
        mood: journalEntries.mood,
      })
      .from(journalEntries)
      .where(
        and(
          isNull(journalEntries.deletedAt),
          gte(journalEntries.entryDate, start),
          lte(journalEntries.entryDate, end),
        ),
      );

    for (const j of journalRows) {
      events.push({
        id: `journal-${j.id}`,
        title: j.title || "Journal Entry",
        date: j.entryDate.substring(0, 10),
        type: "journal",
        color: "#8B5CF6",
        meta: { mood: j.mood },
      });
    }

    // Tasks with due dates
    const taskRows = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        dueDate: tasks.dueDate,
        priority: tasks.priority,
        isCompleted: tasks.isCompleted,
      })
      .from(tasks)
      .where(and(lte(tasks.dueDate, end), gte(tasks.dueDate, start)));

    for (const t of taskRows) {
      events.push({
        id: `task-${t.id}`,
        title: t.title,
        date: t.dueDate!,
        type: "task",
        color: t.isCompleted ? "#10B981" : "#3B82F6",
        meta: { priority: t.priority, isCompleted: t.isCompleted },
      });
    }

    // Habit completions
    const logRows = await db
      .select({
        logId: habitLogs.id,
        logDate: habitLogs.logDate,
        habitId: habitLogs.habitId,
      })
      .from(habitLogs)
      .where(and(gte(habitLogs.logDate, start), lte(habitLogs.logDate, end)));

    // Get habit names
    const habitIds = [...new Set(logRows.map((l) => l.habitId))];
    const habitNameMap = new Map<number, string>();
    if (habitIds.length > 0) {
      const habitRows = await db.select().from(habits);
      for (const h of habitRows) {
        habitNameMap.set(h.id, h.name);
      }
    }

    for (const l of logRows) {
      events.push({
        id: `habit-${l.logId}`,
        title: habitNameMap.get(l.habitId) || "Habit",
        date: l.logDate,
        type: "habit",
        color: "#10B981",
      });
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to get calendar events:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
