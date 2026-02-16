"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FrequencyPicker } from "./FrequencyPicker";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { Plus } from "lucide-react";
import type { HabitWithLogs, HabitCategory } from "@/lib/services/habits.service";

interface HabitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: HabitWithLogs | null;
  categories: HabitCategory[];
  onCategoryCreated?: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    categoryId?: number | null;
    frequency: string;
    frequencyValue?: number | null;
    targetDays?: string[] | null;
  }) => Promise<void>;
}

export function HabitFormDialog({
  open,
  onOpenChange,
  habit,
  categories,
  onCategoryCreated,
  onSubmit,
}: HabitFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("none");
  const [frequency, setFrequency] = useState("daily");
  const [frequencyValue, setFrequencyValue] = useState<number | null>(null);
  const [targetDays, setTargetDays] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description ?? "");
      setCategoryId(habit.categoryId?.toString() ?? "none");
      setFrequency(habit.frequency);
      setFrequencyValue(habit.frequencyValue);
      setTargetDays(habit.targetDays as string[] | null);
    } else {
      setName("");
      setDescription("");
      setCategoryId("none");
      setFrequency("daily");
      setFrequencyValue(null);
      setTargetDays(null);
    }
  }, [habit, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        description: description || undefined,
        categoryId: categoryId !== "none" ? parseInt(categoryId) : null,
        frequency,
        frequencyValue,
        targetDays,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{habit ? "Edit Habit" : "New Habit"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-1.5 block">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Meditation"
              required
            />
          </div>
          <div>
            <Label htmlFor="description" className="mb-1.5 block">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Category</Label>
            <div className="flex gap-2">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCatDialogOpen(true)}
                title="Add category"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <CategoryFormDialog
              open={catDialogOpen}
              onOpenChange={setCatDialogOpen}
              onCreated={() => onCategoryCreated?.()}
            />
          </div>
          <FrequencyPicker
            frequency={frequency}
            frequencyValue={frequencyValue}
            targetDays={targetDays}
            onFrequencyChange={setFrequency}
            onFrequencyValueChange={setFrequencyValue}
            onTargetDaysChange={setTargetDays}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Saving..." : habit ? "Save Changes" : "Create Habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
