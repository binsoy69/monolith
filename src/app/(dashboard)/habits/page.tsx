import { HabitList } from "@/components/habits/HabitList";

export default function HabitsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
        <p className="text-sm text-muted-foreground">Track your daily progress</p>
      </div>
      <HabitList />
    </div>
  );
}
