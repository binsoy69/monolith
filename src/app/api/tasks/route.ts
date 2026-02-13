import { NextResponse } from "next/server";
import { tasksService } from "@/lib/services/tasks.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const completed = searchParams.get("completed");
    const priority = searchParams.get("priority");
    const parentId = searchParams.get("parentId");
    const dueBefore = searchParams.get("dueBefore") ?? undefined;
    const dueAfter = searchParams.get("dueAfter") ?? undefined;

    const tasks = await tasksService.getTasks({
      completed: completed !== null ? completed === "true" : undefined,
      priority: priority !== null ? parseInt(priority) : undefined,
      parentId:
        parentId !== null
          ? parentId === "null"
            ? null
            : parseInt(parentId)
          : undefined,
      topLevelOnly: parentId === null ? true : undefined,
      dueBefore,
      dueAfter,
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to get tasks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, priority, dueDate, parentId, tags } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const task = await tasksService.createTask({
      title: title.trim(),
      description,
      priority,
      dueDate,
      parentId,
      tags,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
