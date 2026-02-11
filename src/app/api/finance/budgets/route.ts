import { NextResponse } from "next/server";
import { financeService } from "@/lib/services/finance.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const budgets = await financeService.getBudgets();
    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Failed to get budgets:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, amount, period, startDate } = body;

    if (!categoryId || !amount || !startDate) {
      return NextResponse.json({ error: "categoryId, amount, startDate required" }, { status: 400 });
    }

    const budget = await financeService.createBudget({
      categoryId, amount, period, startDate,
    });
    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Failed to create budget:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
