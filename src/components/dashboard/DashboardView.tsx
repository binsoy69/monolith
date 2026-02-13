"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  BookOpen,
  PieChart,
  ListTodo,
  Calendar,
  ArrowRight,
  Flame,
  TrendingUp,
} from "lucide-react";
import type { TodaySnapshot } from "@/lib/services/dashboard.service";
import { toast } from "sonner";

const priorityLabels = ["", "Low", "Medium", "High"];
const priorityColors = [
  "",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
];

const moodEmojis: Record<string, string> = {
  great: "😄",
  good: "🙂",
  okay: "😐",
  bad: "😔",
  terrible: "😢",
};

export function DashboardView() {
  const [data, setData] = React.useState<TodaySnapshot | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/dashboard/today")
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  async function toggleHabit(habitId: number) {
    try {
      const today = new Date().toISOString().split("T")[0];
      const habit = data?.habitsDue.find((h) => h.id === habitId);
      if (habit?.completed) {
        await fetch(`/api/habits/${habitId}/log/${today}`, {
          method: "DELETE",
        });
      } else {
        await fetch(`/api/habits/${habitId}/log`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: today }),
        });
      }
      // Refetch
      const r = await fetch("/api/dashboard/today");
      setData(await r.json());
    } catch {
      toast.error("Failed to update habit");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {data.greeting} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {new Date(data.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                <Flame className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {data.stats.habitsCompletedToday}/
                  {data.stats.habitsTotalToday}
                </p>
                <p className="text-xs text-muted-foreground">Habits done</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                <ListTodo className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.tasksPending}</p>
                <p className="text-xs text-muted-foreground">Tasks pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {data.stats.journalEntriesToday}
                </p>
                <p className="text-xs text-muted-foreground">Journal today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {data.stats.tasksCompleted}
                </p>
                <p className="text-xs text-muted-foreground">Tasks completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Habits Due Today */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Habits Due Today
              </CardTitle>
              <Link
                href="/habits"
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.habitsDue.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No habits tracked yet
              </p>
            ) : (
              <div className="space-y-2">
                {data.habitsDue.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2"
                  >
                    <Checkbox
                      checked={habit.completed}
                      onCheckedChange={() => toggleHabit(habit.id)}
                    />
                    <span
                      className={`text-sm flex-1 ${habit.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {habit.name}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {habit.frequency}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <ListTodo className="h-4 w-4 text-blue-500" />
                Upcoming Tasks
              </CardTitle>
              <Link
                href="/tasks"
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No upcoming tasks
              </p>
            ) : (
              <div className="space-y-2">
                {data.upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2"
                  >
                    <span className="text-sm flex-1">{task.title}</span>
                    {(task.priority ?? 0) > 0 && (
                      <Badge
                        className={`text-[10px] ${priorityColors[task.priority ?? 0]}`}
                      >
                        {priorityLabels[task.priority ?? 0]}
                      </Badge>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Journal */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-purple-500" />
                Recent Journal
              </CardTitle>
              <Link
                href="/journal"
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.recentJournal.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No journal entries yet
              </p>
            ) : (
              <div className="space-y-2">
                {data.recentJournal.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/journal/${entry.id}`}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50"
                  >
                    {entry.mood && (
                      <span className="text-lg">
                        {moodEmojis[entry.mood] || "📝"}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {entry.title || "Untitled"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.entryDate}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Snapshot */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChart className="h-4 w-4 text-amber-500" />
                Budget Snapshot
              </CardTitle>
              <Link
                href="/finance"
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.budgetSnapshot.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No budgets set
              </p>
            ) : (
              <div className="space-y-3">
                {data.budgetSnapshot.map((budget) => {
                  const pct = Math.min(
                    Math.round((budget.spent / budget.budgetAmount) * 100),
                    100,
                  );
                  return (
                    <div key={budget.categoryName} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{budget.categoryName}</span>
                        <span className="text-xs text-muted-foreground">
                          ₱{(budget.spent / 100).toLocaleString()} / ₱
                          {(budget.budgetAmount / 100).toLocaleString()}
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
