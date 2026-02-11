"use client";

import { useMemo } from "react";
import { toISODate } from "@/lib/utils/dates";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { HabitLog } from "@/lib/services/habits.service";

interface StreakGraphProps {
  logs: HabitLog[];
  days?: number;
}

export function StreakGraph({ logs, days = 90 }: StreakGraphProps) {
  const grid = useMemo(() => {
    const completedDates = new Set(
      logs.filter((l) => l.completed).map((l) => l.logDate),
    );

    const today = new Date();
    const cells: { date: string; completed: boolean; dayOfWeek: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = toISODate(d);
      cells.push({
        date: dateStr,
        completed: completedDates.has(dateStr),
        dayOfWeek: d.getDay(),
      });
    }

    return cells;
  }, [logs, days]);

  // Group into weeks (columns)
  const weeks: typeof grid[] = [];
  let currentWeek: typeof grid = [];
  for (const cell of grid) {
    if (cell.dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(cell);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell) => (
                <Tooltip key={cell.date}>
                  <TooltipTrigger asChild>
                    <div
                      className={`h-3 w-3 rounded-sm ${
                        cell.completed
                          ? "bg-success"
                          : "bg-muted"
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {cell.date} — {cell.completed ? "Completed" : "Missed"}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
