"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { HabitCard } from "./HabitCard";
import { HabitFormDialog } from "./HabitFormDialog";
import { StreakGraph } from "./StreakGraph";
import { toISODate } from "@/lib/utils/dates";
import type {
  HabitWithLogs,
  HabitCategory,
} from "@/lib/services/habits.service";

export function HabitList() {
  const [habits, setHabits] = useState<HabitWithLogs[]>([]);
  const [categories, setCategories] = useState<HabitCategory[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithLogs | null>(null);
  const [consistency, setConsistency] = useState<{
    dateCounts: Record<string, number>;
    totalHabits: number;
  } | null>(null);
  const [days, setDays] = useState<number>(365);
  const today = toISODate(new Date());

  const fetchHabits = useCallback(async () => {
    try {
      const params = new URLSearchParams({ date: today });
      if (filterCategory !== "all") {
        params.set("categoryId", filterCategory);
      }
      const res = await fetch(`/api/habits?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setHabits(data);
    } catch {
      toast.error("Failed to load habits");
    }
  }, [today, filterCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/habits/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      setCategories(await res.json());
    } catch {
      // Categories are optional
    }
  }, []);

  const fetchConsistency = useCallback(async () => {
    try {
      const res = await fetch(`/api/habits/consistency?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch");
      setConsistency(await res.json());
    } catch {
      // Non-critical
    }
  }, [days]);

  useEffect(() => {
    fetchHabits();
    fetchCategories();
    fetchConsistency();
  }, [fetchHabits, fetchCategories, fetchConsistency]);

  async function handleToggle(habitId: number, completed: boolean) {
    // Optimistic update
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        if (completed) {
          return {
            ...h,
            logs: [
              ...h.logs,
              {
                id: 0,
                habitId,
                logDate: today,
                completed: true,
                note: null,
                createdAt: "",
              },
            ],
          };
        }
        return { ...h, logs: h.logs.filter((l) => l.logDate !== today) };
      }),
    );

    try {
      if (completed) {
        await fetch(`/api/habits/${habitId}/log`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: today }),
        });
      } else {
        await fetch(`/api/habits/${habitId}/log/${today}`, {
          method: "DELETE",
        });
      }
      fetchHabits();
      fetchConsistency();
    } catch {
      toast.error("Failed to update habit log");
      fetchHabits();
    }
  }

  async function handleSubmit(data: {
    name: string;
    description?: string;
    categoryId?: number | null;
    frequency: string;
    frequencyValue?: number | null;
    targetDays?: string[] | null;
  }) {
    try {
      if (editingHabit) {
        const res = await fetch(`/api/habits/${editingHabit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("Habit updated");
      } else {
        const res = await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to create");
        toast.success("Habit created");
      }
      setEditingHabit(null);
      fetchHabits();
    } catch {
      toast.error("Failed to save habit");
    }
  }

  return (
    <div className="space-y-6">
      {/* Consistency Graph */}
      {consistency && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Consistency</CardTitle>
            <Select
              value={days.toString()}
              onValueChange={(v) => setDays(parseInt(v))}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <StreakGraph
              dateCounts={consistency.dateCounts}
              totalHabits={consistency.totalHabits}
              days={days}
              endDate={today}
            />
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            setEditingHabit(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Habit
        </Button>
      </div>

      {/* Habits List */}
      <div className="space-y-2">
        {habits.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No habits yet. Create your first habit to get started!</p>
          </div>
        ) : (
          habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              today={today}
              onToggle={handleToggle}
            />
          ))
        )}
      </div>

      <HabitFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        habit={editingHabit}
        categories={categories}
        onCategoryCreated={fetchCategories}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
