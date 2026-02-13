import { CalendarView } from "@/components/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          View habits, journal entries, and task deadlines in one place
        </p>
      </div>
      <CalendarView />
    </div>
  );
}
