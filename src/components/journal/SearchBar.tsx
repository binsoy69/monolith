"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { JournalEntryWithTags } from "@/lib/services/journal.service";

interface SearchBarProps {
  onResults: (entries: JournalEntryWithTags[] | null) => void;
}

export function SearchBar({ onResults }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        onResults(null);
        return;
      }
      try {
        const res = await fetch(`/api/journal/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error();
        onResults(await res.json());
      } catch {
        onResults(null);
      }
    },
    [onResults],
  );

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search entries..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
