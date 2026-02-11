import { NextResponse } from "next/server";
import { financeService } from "@/lib/services/finance.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "income" | "expense" | null;
    const categories = await financeService.getCategories(type ?? undefined);
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to get categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, color, icon } = body;

    if (!name || !type || !color) {
      return NextResponse.json({ error: "Name, type, and color required" }, { status: 400 });
    }

    const category = await financeService.createCategory({ name, type, color, icon });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
