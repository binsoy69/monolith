import { NextResponse } from "next/server";
import { tasksService } from "@/lib/services/tasks.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, sourceFile } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Markdown content is required" },
        { status: 400 },
      );
    }

    const tasks = await tasksService.importFromMarkdown(content, sourceFile);
    return NextResponse.json(
      { imported: tasks.length, tasks },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to import tasks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
