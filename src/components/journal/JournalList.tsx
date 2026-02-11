"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { JournalCard } from "./JournalCard";
import { JournalFilters } from "./JournalFilters";
import { SearchBar } from "./SearchBar";
import type { JournalEntryWithTags } from "@/lib/services/journal.service";

export function JournalList() {
  const [entries, setEntries] = useState<JournalEntryWithTags[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [mood, setMood] = useState("all");
  const [tag, setTag] = useState("all");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<JournalEntryWithTags[] | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (mood !== "all") params.set("mood", mood);
      if (tag !== "all") params.set("tag", tag);

      const res = await fetch(`/api/journal?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEntries(data.entries);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load journal entries");
    }
  }, [page, mood, tag]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    // Fetch all tags for filter
    fetch("/api/journal?limit=1000")
      .then((r) => r.json())
      .then((data) => {
        const tags = new Set<string>();
        data.entries?.forEach((e: JournalEntryWithTags) =>
          e.tags?.forEach((t) => tags.add(t)),
        );
        setAllTags([...tags].sort());
      })
      .catch(() => {});
  }, []);

  const displayEntries = searchResults ?? entries;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <JournalFilters
          mood={mood}
          tag={tag}
          tags={allTags}
          onMoodChange={(m) => { setMood(m); setPage(1); }}
          onTagChange={(t) => { setTag(t); setPage(1); }}
        />
        <Button asChild>
          <Link href="/journal/new">
            <Plus className="h-4 w-4 mr-1.5" />
            New Entry
          </Link>
        </Button>
      </div>

      <SearchBar onResults={setSearchResults} />

      <div className="space-y-3">
        {displayEntries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchResults ? "No results found." : "No journal entries yet. Start writing!"}
          </div>
        ) : (
          displayEntries.map((entry) => (
            <JournalCard key={entry.id} entry={entry} />
          ))
        )}
      </div>

      {!searchResults && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
