"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  isSameDay,
  parseISO,
} from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { JournalCard } from "./JournalCard";
import type { JournalEntryWithTags } from "@/lib/services/journal.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Calendar as CalendarIcon } from "lucide-react";

export function JournalCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  const [monthEntries, setMonthEntries] = useState<JournalEntryWithTags[]>([]);
  const [selectedDayEntries, setSelectedDayEntries] = useState<
    JournalEntryWithTags[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch entries for the entire month to show indicators
  const fetchMonthEntries = useCallback(async (currentMonth: Date) => {
    try {
      const start = startOfMonth(currentMonth).toISOString();
      const end = endOfMonth(currentMonth).toISOString();

      const params = new URLSearchParams({
        startDate: start,
        endDate: end,
        limit: "100", // Assume no more than 100 entries per month for now, or paginate if needed
      });

      const res = await fetch(`/api/journal?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMonthEntries(data.entries);
    } catch {
      toast.error("Failed to load month entries");
    }
  }, []);

  // Fetch entries for the specific selected day
  const fetchDayEntries = useCallback(async (selectedDate: Date) => {
    setIsLoading(true);
    try {
      const start = startOfDay(selectedDate).toISOString();
      const end = endOfDay(selectedDate).toISOString();

      const params = new URLSearchParams({
        startDate: start,
        endDate: end,
        limit: "50",
      });

      const res = await fetch(`/api/journal?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSelectedDayEntries(data.entries);
    } catch {
      toast.error("Failed to load entries for selected date");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to fetch month data when month changes
  useEffect(() => {
    fetchMonthEntries(month);
  }, [month, fetchMonthEntries]);

  // Effect to fetch day data when date changes
  useEffect(() => {
    if (date) {
      fetchDayEntries(date);
    } else {
      setSelectedDayEntries([]);
    }
  }, [date, fetchDayEntries]);

  // Update indicators whenever month entries change
  const datesWithEntries = monthEntries.map((entry) =>
    parseISO(entry.entryDate),
  );

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
      {/* Calendar Section */}
      <div className="flex min-w-0 flex-col gap-4 md:col-span-4">
        <div className="overflow-hidden rounded-xl border bg-card/30 p-4 shadow-sm backdrop-blur-sm">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={month}
            onMonthChange={setMonth}
            className="w-full"
            modifiers={{
              hasEntry: (day) => {
                return datesWithEntries.some((d) => isSameDay(d, day));
              },
            }}
            modifiersClassNames={{
              hasEntry:
                "after:content-[''] after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full",
            }}
          />
          <div className="mt-6">
            <Button
              asChild
              className="w-full font-medium shadow-lg shadow-primary/20"
              size="lg"
            >
              <Link href="/journal/new">
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Entries Section */}
      <div className="md:col-span-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            {date ? format(date, "MMMM do, yyyy") : "Select a date"}
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-xl border bg-muted/20 animate-pulse"
              />
            ))}
          </div>
        ) : selectedDayEntries.length > 0 ? (
          <div className="grid gap-4 animate-in fade-in duration-500">
            {selectedDayEntries.map((entry) => (
              <JournalCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-xl bg-muted/5 border-dashed">
            <div className="bg-muted/20 p-4 rounded-full mb-4">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No entries for this day</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mt-2">
              "The scariest moment is always just before you start."
            </p>
            <Button asChild variant="outline">
              <Link href="/journal/new">Write something</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
