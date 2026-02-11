"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/dates";
import type { HabitLog } from "@/lib/services/habits.service";

interface HabitHistoryProps {
  logs: HabitLog[];
}

export function HabitHistory({ logs }: HabitHistoryProps) {
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime(),
  );

  if (sortedLogs.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">No completions recorded yet.</p>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2 pr-4">
        {sortedLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <div>
              <p className="text-sm font-medium">{formatDate(log.logDate)}</p>
              {log.note && (
                <p className="text-xs text-muted-foreground mt-0.5">{log.note}</p>
              )}
            </div>
            <Badge variant={log.completed ? "default" : "secondary"}>
              {log.completed ? "Completed" : "Skipped"}
            </Badge>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
