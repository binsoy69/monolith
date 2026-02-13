"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "./CategoryBadge";
import { Flame } from "lucide-react";
import Link from "next/link";
import type { HabitWithLogs } from "@/lib/services/habits.service";

interface HabitCardProps {
  habit: HabitWithLogs;
  today: string;
  onToggle: (habitId: number, completed: boolean) => void;
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  every_n_days: "Custom",
};

export function HabitCard({ habit, today, onToggle }: HabitCardProps) {
  const isCompletedToday = habit.logs.some(
    (l) => l.logDate === today && l.completed,
  );
  const currentStreak = habit.stats?.currentStreak ?? 0;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
      <Checkbox
        checked={isCompletedToday}
        onCheckedChange={(checked) => onToggle(habit.id, !!checked)}
        className="h-5 w-5"
        aria-label={`Mark "${habit.name}" as ${isCompletedToday ? "incomplete" : "complete"}`}
      />
      <Link
        href={`/habits/${habit.id}`}
        className="flex flex-1 items-center justify-between min-w-0"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-medium truncate ${isCompletedToday ? "line-through text-muted-foreground" : ""}`}
            >
              {habit.name}
            </span>
            {habit.category && (
              <CategoryBadge
                name={habit.category.name}
                color={habit.category.color}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {FREQUENCY_LABELS[habit.frequency]}
            {habit.frequency === "every_n_days" && habit.frequencyValue
              ? ` (every ${habit.frequencyValue} days)`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {currentStreak > 0 ? (
            <Badge variant="secondary" className="gap-1 font-medium">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              {currentStreak} day{currentStreak !== 1 ? "s" : ""}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      </Link>
    </div>
  );
}
