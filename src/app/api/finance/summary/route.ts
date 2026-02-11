import { NextResponse } from "next/server";
import { financeService } from "@/lib/services/finance.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));
    const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1));

    const summary = await financeService.getMonthlySummary(year, month);

    // Also process recurring transactions on overview load
    await financeService.processRecurringTransactions();

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Failed to get summary:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
