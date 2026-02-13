"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, FileUp, Search } from "lucide-react";
import { TaskItem } from "./TaskItem";
import { TaskFormDialog } from "./TaskFormDialog";
import { TaskImportDialog } from "./TaskImportDialog";
import type { TaskWithSubtasks } from "@/lib/services/tasks.service";
import { toast } from "sonner";

export function TaskList() {
  const [tasks, setTasks] = React.useState<TaskWithSubtasks[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterPriority, setFilterPriority] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [formOpen, setFormOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TaskWithSubtasks | null>(
    null,
  );

  const fetchTasks = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus === "completed") params.set("completed", "true");
      if (filterStatus === "pending") params.set("completed", "false");
      if (filterPriority !== "all") params.set("priority", filterPriority);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTasks(data);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filterPriority, filterStatus]);

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleToggle(id: number) {
    try {
      await fetch(`/api/tasks/${id}/toggle`, { method: "PUT" });
      fetchTasks();
    } catch {
      toast.error("Failed to toggle task");
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      toast.success("Task deleted");
      fetchTasks();
    } catch {
      toast.error("Failed to delete task");
    }
  }

  async function handleSubmit(data: {
    title: string;
    description?: string;
    priority: number;
    dueDate?: string;
    parentId?: number | null;
    tags?: string[];
  }) {
    try {
      if (editingTask) {
        await fetch(`/api/tasks/${editingTask.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toast.success("Task updated");
      } else {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toast.success("Task created");
      }
      setEditingTask(null);
      fetchTasks();
    } catch {
      toast.error("Failed to save task");
    }
  }

  async function handleImport(content: string) {
    try {
      const res = await fetch("/api/tasks/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      toast.success(`Imported ${data.imported} tasks`);
      fetchTasks();
    } catch {
      toast.error("Failed to import tasks");
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (!search) return true;
    return t.title.toLowerCase().includes(search.toLowerCase());
  });

  const completedCount = tasks.reduce((acc, t) => {
    const count = (task: TaskWithSubtasks): number => {
      let c = task.isCompleted ? 1 : 0;
      for (const sub of task.subtasks) c += count(sub);
      return c;
    };
    return acc + count(t);
  }, 0);

  const totalCount = tasks.reduce((acc, t) => {
    const count = (task: TaskWithSubtasks): number => {
      let c = 1;
      for (const sub of task.subtasks) c += count(sub);
      return c;
    };
    return acc + count(t);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {completedCount}/{totalCount} completed
            </span>
            {totalCount > 0 && (
              <div className="h-2 flex-1 max-w-[200px] rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="1">Low</SelectItem>
            <SelectItem value="2">Medium</SelectItem>
            <SelectItem value="3">High</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setImportOpen(true)}>
          <FileUp className="h-4 w-4 mr-1.5" />
          Import
        </Button>
        <Button
          onClick={() => {
            setEditingTask(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Task
        </Button>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No tasks yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a task or import from markdown to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={(t) => {
                setEditingTask(t);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
        onSubmit={handleSubmit}
      />

      <TaskImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImport}
      />
    </div>
  );
}
