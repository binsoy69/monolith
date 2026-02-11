import { NextResponse } from "next/server";
import { financeService } from "@/lib/services/finance.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const accounts = await financeService.getAccounts();
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Failed to get accounts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, balance, currency } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const account = await financeService.createAccount({
      name: name.trim(),
      balance,
      currency,
    });
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("Failed to create account:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
