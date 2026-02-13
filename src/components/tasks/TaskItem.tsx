"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  GripVertical,
  Trash2,
  Edit,
  Calendar,
} from "lucide-react";
import type { TaskWithSubtasks } from "@/lib/services/tasks.service";

const priorityConfig = [
  { label: "None", color: "bg-muted text-muted-foreground" },
  {
    label: "Low",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    label: "Medium",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  },
  {
    label: "High",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
];

interface TaskItemProps {
  task: TaskWithSubtasks;
  onToggle: (id: number) => void;
  onEdit: (task: TaskWithSubtasks) => void;
  onDelete: (id: number) => void;
  depth?: number;
}

export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  depth = 0,
}: TaskItemProps) {
  const [expanded, setExpanded] = React.useState(true);
  const hasSubtasks = task.subtasks.length > 0;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-lg border bg-elevated px-3 py-2.5 transition-all hover:shadow-sm",
          task.isCompleted && "opacity-60",
          depth > 0 && "border-dashed",
        )}
        style={{ marginLeft: depth * 24 }}
      >
        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100" />

        {hasSubtasks && (
          <button onClick={() => setExpanded(!expanded)} className="shrink-0">
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                expanded && "rotate-90",
              )}
            />
          </button>
        )}

        <Checkbox
          checked={task.isCompleted ?? false}
          onCheckedChange={() => onToggle(task.id)}
          className="shrink-0"
        />

        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "text-sm font-medium",
              task.isCompleted && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </span>
          {task.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {task.dueDate}
            </span>
          )}

          {(task.priority ?? 0) > 0 && (
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] px-1.5 py-0",
                priorityConfig[task.priority ?? 0].color,
              )}
            >
              {priorityConfig[task.priority ?? 0].label}
            </Badge>
          )}

          {task.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-[10px] px-1.5 py-0"
            >
              {tag}
            </Badge>
          ))}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100"
            onClick={() => onEdit(task)}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {hasSubtasks && expanded && (
        <div className="mt-1 space-y-1">
          {task.subtasks.map((sub) => (
            <TaskItem
              key={sub.id}
              task={sub}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
