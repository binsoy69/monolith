import { NextResponse } from "next/server";
import { financeService } from "@/lib/services/finance.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const type = searchParams.get("type") as "income" | "expense" | "transfer" | null;
    const categoryId = searchParams.get("categoryId");
    const accountId = searchParams.get("accountId");
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;

    const result = await financeService.getTransactions({
      page,
      limit,
      type: type ?? undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      accountId: accountId ? parseInt(accountId) : undefined,
      startDate,
      endDate,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to get transactions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, amount, description, categoryId, accountId, toAccountId, transactionDate, isRecurring, recurrence, tags } = body;

    if (!type || !["income", "expense", "transfer"].includes(type)) {
      return NextResponse.json({ error: "Valid type required" }, { status: 400 });
    }
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Valid amount required" }, { status: 400 });
    }
    if (!accountId) {
      return NextResponse.json({ error: "Account required" }, { status: 400 });
    }
    if (!transactionDate) {
      return NextResponse.json({ error: "Date required" }, { status: 400 });
    }

    const txn = await financeService.createTransaction({
      type, amount, description, categoryId, accountId,
      toAccountId, transactionDate, isRecurring, recurrence, tags,
    });

    return NextResponse.json(txn, { status: 201 });
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
