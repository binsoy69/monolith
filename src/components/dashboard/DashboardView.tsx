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
  ArrowRight,
  Flame,
  TrendingUp,
} from "lucide-react";
import type { TodaySnapshot } from "@/lib/services/dashboard.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

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
      <div className="flex items-center justify-center py-20 text-muted-foreground animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in pb-10">
      {/* Decorative Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">
          {data.greeting}
        </h1>
        <p className="text-text-secondary text-lg">
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
        {[
          {
            label: "Habits done",
            value: `${data.stats.habitsCompletedToday}/${data.stats.habitsTotalToday}`,
            icon: Flame,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-100 dark:bg-green-900/30",
          },
          {
            label: "Tasks pending",
            value: data.stats.tasksPending,
            icon: ListTodo,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/30",
          },
          {
            label: "Journal today",
            value: data.stats.journalEntriesToday,
            icon: BookOpen,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-100 dark:bg-purple-900/30",
          },
          {
            label: "Tasks completed",
            value: data.stats.tasksCompleted,
            icon: TrendingUp,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-100 dark:bg-amber-900/30",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="glass border-border/50 hover:border-accent/50 transition-colors shadow-sm"
          >
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-4">
                <div className={cn("rounded-xl p-3 shrink-0", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-sm text-text-secondary font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Habits Due Today */}
        <Card className="glass border-border/50 shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Habits Due Today
              </CardTitle>
              <Link
                href="/habits"
                className="text-sm font-medium text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {data.habitsDue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 mb-2 opacity-20" />
                <p>No habits tracked yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.habitsDue.map((habit) => (
                  <div
                    key={habit.id}
                    className="group flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-4 py-3 hover:bg-accent/5 transition-colors"
                  >
                    <Checkbox
                      checked={habit.completed}
                      onCheckedChange={() => toggleHabit(habit.id)}
                      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 rounded-full w-5 h-5"
                    />
                    <span
                      className={cn(
                        "text-sm font-medium flex-1 transition-all",
                        habit.completed
                          ? "line-through text-muted-foreground"
                          : "text-text-primary",
                      )}
                    >
                      {habit.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-medium bg-secondary text-secondary-foreground"
                    >
                      {habit.frequency}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="glass border-border/50 shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListTodo className="h-5 w-5 text-blue-500" />
                Upcoming Tasks
              </CardTitle>
              <Link
                href="/tasks"
                className="text-sm font-medium text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {data.upcomingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <ListTodo className="h-8 w-8 mb-2 opacity-20" />
                <p>No upcoming tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-4 py-3 hover:bg-accent/5 transition-colors"
                  >
                    <span className="text-sm font-medium flex-1">
                      {task.title}
                    </span>
                    {(task.priority ?? 0) > 0 && (
                      <Badge
                        className={cn(
                          "text-[10px] shadow-none",
                          priorityColors[task.priority ?? 0],
                        )}
                      >
                        {priorityLabels[task.priority ?? 0]}
                      </Badge>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
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
        <Card className="glass border-border/50 shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-purple-500" />
                Recent Journal
              </CardTitle>
              <Link
                href="/journal"
                className="text-sm font-medium text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {data.recentJournal.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <BookOpen className="h-8 w-8 mb-2 opacity-20" />
                <p>No journal entries yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentJournal.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/journal/${entry.id}`}
                    className="flex items-center gap-4 rounded-xl border border-border/50 bg-background/50 px-4 py-3 hover:bg-accent/5 transition-all hover:scale-[1.01]"
                  >
                    {entry.mood && (
                      <span className="text-2xl bg-secondary rounded-full p-2 h-10 w-10 flex items-center justify-center">
                        {moodEmojis[entry.mood] || "📝"}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate hover:text-accent transition-colors">
                        {entry.title || "Untitled"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
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
        <Card className="glass border-border/50 shadow-sm">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart className="h-5 w-5 text-amber-500" />
                Budget Snapshot
              </CardTitle>
              <Link
                href="/finance"
                className="text-sm font-medium text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {data.budgetSnapshot.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <PieChart className="h-8 w-8 mb-2 opacity-20" />
                <p>No budgets set</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.budgetSnapshot.map((budget) => {
                  const pct = Math.min(
                    Math.round((budget.spent / budget.budgetAmount) * 100),
                    100,
                  );
                  return (
                    <div key={budget.categoryName} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {budget.categoryName}
                        </span>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          ₱{(budget.spent / 100).toLocaleString()} / ₱
                          {(budget.budgetAmount / 100).toLocaleString()}
                        </span>
                      </div>
                      <Progress
                        value={pct}
                        className="h-2.5 rounded-full bg-secondary"
                        indicatorClassName={
                          pct > 90 ? "bg-red-500" : "bg-accent"
                        }
                      />
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
