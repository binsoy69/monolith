"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Flame,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { StreakGraph } from "./StreakGraph";
import { HabitHistory } from "./HabitHistory";
import { HabitFormDialog } from "./HabitFormDialog";
import { CategoryBadge } from "./CategoryBadge";
import type {
  HabitWithLogs,
  HabitCategory,
} from "@/lib/services/habits.service";
import Link from "next/link";

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  every_n_days: "Custom",
};

interface HabitDetailProps {
  habitId: number;
}

export function HabitDetail({ habitId }: HabitDetailProps) {
  const router = useRouter();
  const [habit, setHabit] = useState<HabitWithLogs | null>(null);
  const [categories, setCategories] = useState<HabitCategory[]>([]);
  const [editOpen, setEditOpen] = useState(false);

  const fetchHabit = useCallback(async () => {
    try {
      const res = await fetch(`/api/habits/${habitId}`);
      if (!res.ok) throw new Error("Not found");
      setHabit(await res.json());
    } catch {
      toast.error("Habit not found");
      router.push("/habits");
    }
  }, [habitId, router]);

  useEffect(() => {
    fetchHabit();
    fetch("/api/habits/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, [fetchHabit]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to archive this habit?")) return;
    try {
      await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
      toast.success("Habit archived");
      router.push("/habits");
    } catch {
      toast.error("Failed to archive habit");
    }
  }

  async function handleEdit(data: {
    name: string;
    description?: string;
    categoryId?: number | null;
    frequency: string;
    frequencyValue?: number | null;
    targetDays?: string[] | null;
  }) {
    const res = await fetch(`/api/habits/${habitId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update");
    toast.success("Habit updated");
    fetchHabit();
  }

  if (!habit) {
    return (
      <div className="py-12 text-center text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            aria-label="Back to habits"
          >
            <Link href="/habits">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{habit.name}</h1>
              {habit.category && (
                <CategoryBadge
                  name={habit.category.name}
                  color={habit.category.color}
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {FREQUENCY_LABELS[habit.frequency]}
              {habit.frequency === "every_n_days" && habit.frequencyValue
                ? ` · Every ${habit.frequencyValue} days`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1.5" />
            Archive
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
            <p className="text-2xl font-bold">
              {habit.stats?.currentStreak ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
            <p className="text-2xl font-bold">{habit.stats?.bestStreak ?? 0}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">
              {habit.stats?.completionRate30d ?? 0}%
            </p>
            <p className="text-xs text-muted-foreground">30-day Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Last 90 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <StreakGraph logs={habit.logs} days={90} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Completion History</CardTitle>
            </CardHeader>
            <CardContent>
              <HabitHistory logs={habit.logs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <HabitFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        habit={habit}
        categories={categories}
        onSubmit={handleEdit}
      />
    </div>
  );
}
