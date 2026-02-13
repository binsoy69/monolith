import { db } from "@/lib/db";
import { tasks, taskTags } from "@/lib/db/schema";
import { eq, and, lte, gte, desc, asc, isNull, sql } from "drizzle-orm";
import { parseMarkdownTasks, type ParsedTask } from "@/lib/utils/markdown";

// --- Types ---

type Task = typeof tasks.$inferSelect;

export interface TaskWithSubtasks extends Task {
  tags: string[];
  subtasks: TaskWithSubtasks[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: number;
  dueDate?: string | null;
  parentId?: number | null;
  sourceFile?: string | null;
  tags?: string[];
}

// --- Service ---

export const tasksService = {
  // === List ===

  async getTasks(opts?: {
    completed?: boolean;
    priority?: number;
    parentId?: number | null;
    dueBefore?: string;
    dueAfter?: string;
    topLevelOnly?: boolean;
  }): Promise<TaskWithSubtasks[]> {
    const conditions = [];

    if (opts?.completed !== undefined) {
      conditions.push(eq(tasks.isCompleted, opts.completed));
    }
    if (opts?.priority !== undefined) {
      conditions.push(eq(tasks.priority, opts.priority));
    }
    if (opts?.parentId !== undefined) {
      if (opts.parentId === null) {
        conditions.push(isNull(tasks.parentId));
      } else {
        conditions.push(eq(tasks.parentId, opts.parentId));
      }
    }
    if (opts?.topLevelOnly) {
      conditions.push(isNull(tasks.parentId));
    }
    if (opts?.dueBefore) {
      conditions.push(lte(tasks.dueDate, opts.dueBefore));
    }
    if (opts?.dueAfter) {
      conditions.push(gte(tasks.dueDate, opts.dueAfter));
    }

    const rows =
      conditions.length > 0
        ? await db
            .select()
            .from(tasks)
            .where(and(...conditions))
            .orderBy(asc(tasks.sortOrder), desc(tasks.createdAt))
        : await db
            .select()
            .from(tasks)
            .orderBy(asc(tasks.sortOrder), desc(tasks.createdAt));

    // Fetch tags for all returned tasks
    const taskIds = rows.map((r) => r.id);
    const allTags =
      taskIds.length > 0
        ? await db
            .select()
            .from(taskTags)
            .where(sql`${taskTags.taskId} IN (${sql.raw(taskIds.join(","))})`)
        : [];

    const tagsByTaskId = new Map<number, string[]>();
    for (const t of allTags) {
      const arr = tagsByTaskId.get(t.taskId) || [];
      arr.push(t.tag);
      tagsByTaskId.set(t.taskId, arr);
    }

    // Build tree
    const taskMap = new Map<number, TaskWithSubtasks>();
    const topLevel: TaskWithSubtasks[] = [];

    for (const row of rows) {
      const withSubs: TaskWithSubtasks = {
        ...row,
        tags: tagsByTaskId.get(row.id) || [],
        subtasks: [],
      };
      taskMap.set(row.id, withSubs);
    }

    for (const t of taskMap.values()) {
      if (t.parentId && taskMap.has(t.parentId)) {
        taskMap.get(t.parentId)!.subtasks.push(t);
      } else {
        topLevel.push(t);
      }
    }

    return topLevel;
  },

  // === Get Single ===

  async getTask(id: number): Promise<TaskWithSubtasks | null> {
    const [row] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!row) return null;

    const tags = await db
      .select()
      .from(taskTags)
      .where(eq(taskTags.taskId, id));

    // Get subtasks recursively
    const subtaskRows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.parentId, id))
      .orderBy(asc(tasks.sortOrder));

    const subtasks: TaskWithSubtasks[] = [];
    for (const sub of subtaskRows) {
      const full = await this.getTask(sub.id);
      if (full) subtasks.push(full);
    }

    return {
      ...row,
      tags: tags.map((t) => t.tag),
      subtasks,
    };
  },

  // === Create ===

  async createTask(data: CreateTaskInput): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        title: data.title,
        description: data.description,
        priority: data.priority ?? 0,
        dueDate: data.dueDate ?? null,
        parentId: data.parentId ?? null,
        sourceFile: data.sourceFile ?? null,
      })
      .returning();

    if (data.tags && data.tags.length > 0) {
      await db.insert(taskTags).values(
        data.tags.map((tag) => ({
          taskId: task.id,
          tag,
        })),
      );
    }

    return task;
  },

  // === Update ===

  async updateTask(
    id: number,
    data: Partial<
      CreateTaskInput & { isCompleted: boolean; sortOrder: number }
    >,
  ): Promise<void> {
    const updateValues: Record<string, unknown> = {};

    if (data.title !== undefined) updateValues.title = data.title;
    if (data.description !== undefined)
      updateValues.description = data.description;
    if (data.priority !== undefined) updateValues.priority = data.priority;
    if (data.dueDate !== undefined) updateValues.dueDate = data.dueDate;
    if (data.parentId !== undefined) updateValues.parentId = data.parentId;
    if (data.sortOrder !== undefined) updateValues.sortOrder = data.sortOrder;
    if (data.isCompleted !== undefined) {
      updateValues.isCompleted = data.isCompleted;
      updateValues.completedAt = data.isCompleted
        ? new Date().toISOString()
        : null;
    }

    if (Object.keys(updateValues).length > 0) {
      updateValues.updatedAt = new Date().toISOString();
      await db.update(tasks).set(updateValues).where(eq(tasks.id, id));
    }

    if (data.tags !== undefined) {
      await db.delete(taskTags).where(eq(taskTags.taskId, id));
      if (data.tags.length > 0) {
        await db.insert(taskTags).values(
          data.tags.map((tag) => ({
            taskId: id,
            tag,
          })),
        );
      }
    }
  },

  // === Delete ===

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  },

  // === Toggle ===

  async toggleTask(
    id: number,
  ): Promise<{ isCompleted: boolean; completedAt: string | null }> {
    const [row] = await db.select().from(tasks).where(eq(tasks.id, id));
    if (!row) throw new Error("Task not found");

    const newCompleted = !row.isCompleted;
    const completedAt = newCompleted ? new Date().toISOString() : null;

    await db
      .update(tasks)
      .set({
        isCompleted: newCompleted,
        completedAt,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tasks.id, id));

    return { isCompleted: newCompleted, completedAt };
  },

  // === Reorder ===

  async reorderTasks(
    items: { id: number; sortOrder: number }[],
  ): Promise<void> {
    for (const item of items) {
      await db
        .update(tasks)
        .set({ sortOrder: item.sortOrder, updatedAt: new Date().toISOString() })
        .where(eq(tasks.id, item.id));
    }
  },

  // === Import from Markdown ===

  async importFromMarkdown(
    content: string,
    sourceFile?: string,
  ): Promise<Task[]> {
    const parsed = parseMarkdownTasks(content);
    const created: Task[] = [];

    const importParsed = async (items: ParsedTask[], parentId?: number) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const task = await this.createTask({
          title: item.title,
          parentId: parentId ?? null,
          sourceFile: sourceFile ?? null,
        });

        if (item.isCompleted) {
          await this.toggleTask(task.id);
        }

        created.push(task);

        if (item.children.length > 0) {
          await importParsed(item.children, task.id);
        }
      }
    };

    await importParsed(parsed);
    return created;
  },

  // === Dashboard helpers ===

  async getUpcomingTasks(days: number = 7): Promise<Task[]> {
    const today = new Date().toISOString().split("T")[0];
    const future = new Date();
    future.setDate(future.getDate() + days);
    const futureStr = future.toISOString().split("T")[0];

    return db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.isCompleted, false),
          isNull(tasks.parentId),
          lte(tasks.dueDate, futureStr),
          gte(tasks.dueDate, today),
        ),
      )
      .orderBy(asc(tasks.dueDate));
  },

  async getTaskCountStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
  }> {
    const all = await db.select().from(tasks).where(isNull(tasks.parentId));
    const completed = all.filter((t) => t.isCompleted).length;
    return {
      total: all.length,
      completed,
      pending: all.length - completed,
    };
  },
};
