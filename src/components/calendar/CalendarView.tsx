"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ListTodo,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "journal" | "task" | "habit";
  color: string;
  meta?: Record<string, unknown>;
}

const typeIcons = {
  journal: BookOpen,
  task: ListTodo,
  habit: CheckCircle,
};

const typeLabels = {
  journal: "Journal",
  task: "Task",
  habit: "Habit",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarView() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  React.useEffect(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const start = firstDay.toISOString().split("T")[0];
    const end = lastDay.toISOString().split("T")[0];

    fetch(`/api/calendar/events?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load calendar"));
  }, [year, month]);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  }

  function goToday() {
    setCurrentDate(new Date());
    setSelectedDate(new Date().toISOString().split("T")[0]);
  }

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const arr = eventsByDate.get(e.date) || [];
    arr.push(e);
    eventsByDate.set(e.date, arr);
  }

  const cells: { date: string; day: number; isCurrentMonth: boolean }[] = [];

  // Previous month days
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date: dateStr, day: d, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date: dateStr, day: d, isCurrentMonth: true });
  }

  // Fill remaining cells
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const dateStr = `${year}-${String(month + 2).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date: dateStr, day: d, isCurrentMonth: false });
  }

  const selectedEvents = selectedDate
    ? eventsByDate.get(selectedDate) || []
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Calendar Grid */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {MONTHS[month]} {year}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToday}>
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7">
            {DAYS.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
            {cells.map((cell, i) => {
              const dayEvents = eventsByDate.get(cell.date) || [];
              const isToday = cell.date === today;
              const isSelected = cell.date === selectedDate;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(cell.date)}
                  className={cn(
                    "relative min-h-[72px] border-t p-1.5 text-left transition-colors hover:bg-muted/50",
                    !cell.isCurrentMonth && "opacity-30",
                    isSelected && "bg-accent/10 ring-1 ring-accent",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                      isToday && "bg-accent text-white font-semibold",
                    )}
                  >
                    {cell.day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="mt-0.5 flex flex-wrap gap-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <div
                          key={e.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: e.color }}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-muted-foreground">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {selectedDate
              ? new Date(selectedDate + "T00:00:00").toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  },
                )
              : "Select a day"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Click a day to see events
            </p>
          ) : selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No events on this day
            </p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => {
                const Icon = typeIcons[event.type];
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 rounded-lg border px-3 py-2"
                  >
                    <div
                      className="mt-0.5 rounded p-1"
                      style={{ backgroundColor: event.color + "20" }}
                    >
                      <Icon
                        className="h-3.5 w-3.5"
                        style={{ color: event.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {event.title}
                      </p>
                      <Badge variant="outline" className="text-[10px] mt-1">
                        {typeLabels[event.type]}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
