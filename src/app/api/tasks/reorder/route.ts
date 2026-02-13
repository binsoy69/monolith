import { NextResponse } from "next/server";
import { tasksService } from "@/lib/services/tasks.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 },
      );
    }

    await tasksService.reorderTasks(items);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder tasks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
