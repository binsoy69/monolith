import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  habits,
  habitLogs,
  transactions,
  financeCategories,
  financeAccounts,
} from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  try {
    const { module: mod } = await params;

    let csv = "";

    if (mod === "habits") {
      const allHabits = await db.select().from(habits);
      const allLogs = await db.select().from(habitLogs);

      csv = "ID,Name,Frequency,FrequencyValue,IsArchived,CreatedAt\n";
      for (const h of allHabits) {
        csv += `${h.id},"${(h.name || "").replace(/"/g, '""')}",${h.frequency},${h.frequencyValue ?? ""},${h.isArchived},${h.createdAt}\n`;
      }

      csv += "\n\nHabit Logs\nID,HabitID,LogDate,Completed,Note\n";
      for (const l of allLogs) {
        csv += `${l.id},${l.habitId},${l.logDate},${l.completed},"${(l.note || "").replace(/"/g, '""')}"\n`;
      }
    } else if (mod === "transactions") {
      const allTx = await db.select().from(transactions);
      const allCats = await db.select().from(financeCategories);
      const allAccounts = await db.select().from(financeAccounts);

      const catMap = new Map(allCats.map((c) => [c.id, c.name]));
      const accMap = new Map(allAccounts.map((a) => [a.id, a.name]));

      csv = "ID,Type,Amount,Description,Category,Account,Date,IsRecurring\n";
      for (const t of allTx) {
        csv += `${t.id},${t.type},${(t.amount / 100).toFixed(2)},"${(t.description || "").replace(/"/g, '""')}","${catMap.get(t.categoryId ?? 0) || ""}","${accMap.get(t.accountId) || ""}",${t.transactionDate},${t.isRecurring}\n`;
      }
    } else {
      return NextResponse.json({ error: "Unknown module" }, { status: 400 });
    }

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${mod}-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV export failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
