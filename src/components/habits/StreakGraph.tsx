"use client";

import { useMemo } from "react";
import { toISODate } from "@/lib/utils/dates";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { HabitLog } from "@/lib/services/habits.service";
import { cn } from "@/lib/utils/cn";

interface StreakGraphProps {
  /** Logs for a single habit (binary mode) */
  logs?: HabitLog[];
  /** Date -> count map for combined multi-habit view */
  dateCounts?: Record<string, number>;
  /** Total habits count (for intensity calculation in combined mode) */
  totalHabits?: number;
  days?: number;
  /** End date for the graph window (defaults to today) */
  endDate?: string | Date;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIMELINE_CELL_SIZE = 10;
const TIMELINE_GAP = 2;
const TIMELINE_COLUMN_WIDTH = TIMELINE_CELL_SIZE + TIMELINE_GAP;
const CALENDAR_CELL_HEIGHT = "h-12 sm:h-14";

function getIntensity(count: number, total: number): number {
  if (count === 0) return 0;
  const ratio = total > 0 ? count / total : 1;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

// Modern, vibrant intensity colors
const INTENSITY_CLASSES = [
  "bg-muted/30 dark:bg-muted/20", // Empty
  "bg-emerald-500/20 dark:bg-emerald-900/40", // Level 1
  "bg-emerald-500/40 dark:bg-emerald-700/60", // Level 2
  "bg-emerald-500/70 dark:bg-emerald-600/80", // Level 3
  "bg-emerald-500 dark:bg-emerald-500", // Level 4
];

export function StreakGraph({
  logs,
  dateCounts,
  totalHabits = 1,
  days = 30,
  endDate,
}: StreakGraphProps) {
  // 1. Determine Layout Mode based on days
  // <= 90 days -> Calendar Grid (Month view-ish)
  // > 90 days -> Timeline (GitHub style)
  const isCalendarView = days <= 90;

  // 2. Prepare Data
  const { cells, monthLabels, totalCompletions, weeks } = useMemo(() => {
    const completedDates = logs
      ? new Set(logs.filter((l) => l.completed).map((l) => l.logDate))
      : null;

    const end =
      typeof endDate === "string"
        ? (() => {
            const [year, month, day] = endDate.split("-").map(Number);
            return new Date(year, (month ?? 1) - 1, day ?? 1);
          })()
        : endDate
          ? new Date(endDate)
          : new Date();

    // Reset to start of day to avoid time issues
    end.setHours(0, 0, 0, 0);

    const generatedCells: {
      date: string;
      dateObj: Date;
      count: number;
      intensity: number;
    }[] = [];

    // Calculate Start Date
    // For GitHub style (Timeline), we usually show exactly 'days' number of squares.
    // However, it's often nicer to align to the start of the week for the first column if we want a full block.
    // But GitHub actually just starts 365 days ago, and the first column is partial.

    // We'll generate exactly 'days' cells backward from 'end'.
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      const dateStr = toISODate(d);

      let count: number;
      let intensity: number;

      if (completedDates) {
        count = completedDates.has(dateStr) ? 1 : 0;
        intensity = count > 0 ? 4 : 0;
      } else if (dateCounts) {
        count = dateCounts[dateStr] ?? 0;
        intensity = getIntensity(count, totalHabits);
      } else {
        count = 0;
        intensity = 0;
      }

      generatedCells.push({
        date: dateStr,
        dateObj: d,
        count,
        intensity,
      });
    }

    // Group into weeks for Timeline View
    const cols: (typeof generatedCells | null)[][] = [];
    if (!isCalendarView) {
      // Timeline View Logic (GitHub Style)
      // We need to group by columns (weeks), where each column is 7 days (Sun-Sat).
      // The first day's cell determines the start ROW of the first column.

      const startDay = generatedCells[0].dateObj.getDay(); // 0=Sun
      let currentWeek: ((typeof generatedCells)[0] | null)[] =
        Array(startDay).fill(null); // Pad start

      generatedCells.forEach((cell) => {
        currentWeek.push(cell);
        if (currentWeek.length === 7) {
          cols.push(currentWeek);
          currentWeek = [];
        }
      });
      if (currentWeek.length > 0) {
        // Fill rest of the last week with nulls if needed, or just push as is (rendering handles it)
        // GitHub usually just stops rendering.
        cols.push(currentWeek);
      }
    }

    // Calculate Month Positions for Timeline
    const labels: { label: string; index: number }[] = [];
    if (!isCalendarView) {
      // Label only real month boundaries (day 1) so partial months at the
      // graph edges do not create duplicate labels (e.g., Feb ... Feb).
      cols.forEach((week, colIndex) => {
        const monthStartCell = week.find((cell) => cell && cell.dateObj.getDate() === 1);
        if (monthStartCell) {
          labels.push({
            label: MONTH_LABELS[monthStartCell.dateObj.getMonth()],
            index: colIndex,
          });
        }
      });
    }

    const total = generatedCells.reduce((sum, c) => sum + c.count, 0);

    return {
      cells: generatedCells,
      monthLabels: labels,
      totalCompletions: total,
      weeks: cols,
    };
  }, [logs, dateCounts, totalHabits, days, endDate, isCalendarView]);

  // --- RENDER: Calendar Grid View (Refined) ---
  if (isCalendarView) {
    // We want to fill the card. CSS Grid is perfect.
    // We need to pad the START of the grid so the first day aligns with its day of week.
    const startDayOfWeek = cells[0].dateObj.getDay(); // 0=Sun, 6=Sat
    const blanks = Array.from({ length: startDayOfWeek });

    return (
      <TooltipProvider delayDuration={100}>
        <div className="w-full space-y-4">
          {/* Header / Stats within the graph area if desired, or just the grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Weekday Labels */}
            {WEEKDAY_LABELS.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1"
              >
                {day}
              </div>
            ))}

            {/* Blanks for alignment */}
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className={CALENDAR_CELL_HEIGHT} />
            ))}

            {/* Days */}
            {cells.map((cell) => (
              <Tooltip key={cell.date}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "w-full rounded-md flex items-center justify-center transition-all duration-200 hover:ring-2 hover:ring-ring hover:ring-offset-1 hover:ring-offset-background cursor-default",
                      CALENDAR_CELL_HEIGHT,
                      cell.intensity === 0
                        ? "bg-muted/30 dark:bg-secondary/30 hover:bg-muted/50"
                        : INTENSITY_CLASSES[cell.intensity],
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] sm:text-xs font-semibold select-none",
                        cell.intensity > 1
                          ? "text-primary-foreground/90"
                          : "text-muted-foreground/40",
                      )}
                    >
                      {cell.dateObj.getDate()}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div className="font-semibold mb-0.5">
                    {cell.dateObj.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-muted-foreground">
                    {cell.count} completion{cell.count !== 1 ? "s" : ""}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <div>
              <span className="font-medium text-foreground">
                {totalCompletions}
              </span>{" "}
              completions in last {days} days
            </div>
            {/* Legend */}
            <div className="flex items-center gap-1">
              <span className="scale-90">Less</span>
              {INTENSITY_CLASSES.map((cls, i) => (
                <div key={i} className={cn("h-3 w-3 rounded-[2px]", cls)} />
              ))}
              <span className="scale-90">More</span>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // --- RENDER: Timeline View (GitHub Style, Scrollable) ---
  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-2">
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          {/* Container */}
          <div className="min-w-max">
            {/* Month Labels row */}
            <div className="flex text-[10px] text-muted-foreground mb-1.5 h-3 relative">
              {monthLabels.map((m, i) => (
                <div
                  key={`${m.label}-${i}`}
                  className="absolute"
                  style={{ left: `${m.index * TIMELINE_COLUMN_WIDTH}px` }}
                >
                  {" "}
                  {/* Keep label offset in sync with cell width + gap */}
                  {m.label}
                </div>
              ))}
            </div>

            <div className="flex gap-[2px]">
              {/* Day Labels Column */}
              <div className="grid grid-rows-7 gap-[2px] mr-2 text-[9px] text-muted-foreground leading-[10px] h-max pt-[2px]">
                {" "}
                {/* Align with cells */}
                <span className="row-start-2">Mon</span>{" "}
                {/* Mon is index 1 (0-indexed) or row-start-2 (1-indexed CSS grid) */}
                <span className="row-start-4">Wed</span>
                <span className="row-start-6">Fri</span>
              </div>

              {/* The Grid Columns */}
              <div className="flex gap-[2px]">
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-rows-7 gap-[2px]">
                    {week.map((cell, di) => {
                      if (!cell)
                        return (
                          <div
                            key={`blank-${wi}-${di}`}
                            className="h-[10px] w-[10px]"
                          />
                        ); // Spacer for padding
                      return (
                        <Tooltip key={cell.date}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "h-[10px] w-[10px] rounded-[1px] transition-colors",
                                cell.intensity === 0
                                  ? "bg-muted/40 hover:bg-muted/60"
                                  : INTENSITY_CLASSES[cell.intensity],
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <span className="font-semibold">
                              {cell.count} completions
                            </span>{" "}
                            on {cell.dateObj.toLocaleDateString()}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>{totalCompletions} in last year</div>
          <div className="flex items-center gap-1">
            <span className="scale-90">Less</span>
            {INTENSITY_CLASSES.map((cls, i) => (
              <div key={i} className={cn("h-2.5 w-2.5 rounded-[1px]", cls)} />
            ))}
            <span className="scale-90">More</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
