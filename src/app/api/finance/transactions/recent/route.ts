import { NextResponse } from "next/server";
import { financeService } from "@/lib/services/finance.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const recent = await financeService.getRecentTransactions(5);
    return NextResponse.json(recent);
  } catch (error) {
    console.error("Failed to get recent transactions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
