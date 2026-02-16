import { NextResponse } from "next/server";
import { financeService } from "@/lib/services/finance.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, icon, color } = body;
    await financeService.updateAccount(parseInt(id), { name, icon, color });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update account:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await financeService.deleteAccount(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete account:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
