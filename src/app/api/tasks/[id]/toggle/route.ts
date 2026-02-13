import { NextResponse } from "next/server";
import { tasksService } from "@/lib/services/tasks.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await tasksService.toggleTask(parseInt(id));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to toggle task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
