"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { FileText, Folder } from "lucide-react";
import type { SearchResult } from "@/lib/services/vault.service";

interface QuickOpenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFile: (path: string) => void;
}

export function QuickOpenDialog({
  open,
  onOpenChange,
  onSelectFile,
}: QuickOpenDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/vault/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setResults(await res.json());
    } catch {
      // Ignore search errors
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery("");
      setResults([]);
    }
    onOpenChange(nextOpen);
  }, [onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder="Search files..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No files found.</CommandEmpty>
        <CommandGroup heading="Results">
          {results.map((result) => (
            <CommandItem
              key={result.path}
              value={result.path}
              onSelect={() => {
                if (result.type === "file") {
                  onSelectFile(result.path);
                  onOpenChange(false);
                }
              }}
            >
              {result.type === "folder" ? (
                <Folder className="mr-2 h-4 w-4 text-accent" />
              ) : (
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              )}
              <span>{result.path}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
