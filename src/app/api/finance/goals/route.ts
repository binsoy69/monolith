import { NextResponse } from "next/server";
import { financeService } from "@/lib/services/finance.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const goals = await financeService.getSavingsGoals();
    return NextResponse.json(goals);
  } catch (error) {
    console.error("Failed to get savings goals:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, target, deadline } = body;

    if (!name || !target) {
      return NextResponse.json({ error: "Name and target required" }, { status: 400 });
    }

    const goal = await financeService.createSavingsGoal({ name, target, deadline });
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Failed to create savings goal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await financeService.updateSavingsGoal(id, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update savings goal:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
