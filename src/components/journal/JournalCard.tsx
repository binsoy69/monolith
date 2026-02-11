"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/dates";
import { getMoodEmoji } from "./MoodPicker";
import type { JournalEntryWithTags } from "@/lib/services/journal.service";

interface JournalCardProps {
  entry: JournalEntryWithTags;
}

export function JournalCard({ entry }: JournalCardProps) {
  const preview = entry.content
    ? entry.content.replace(/[#*_~`>\[\]!()-]/g, "").slice(0, 120)
    : "";

  return (
    <Link href={`/journal/${entry.id}`}>
      <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              {formatDate(entry.entryDate)}
            </p>
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">
                {entry.title || "Untitled"}
              </h3>
              {entry.mood && (
                <span className="text-lg shrink-0" title={entry.mood}>
                  {getMoodEmoji(entry.mood)}
                </span>
              )}
            </div>
            {preview && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {preview}...
              </p>
            )}
          </div>
        </div>
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
