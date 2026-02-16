"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MoodPicker, getMoodEmoji } from "./MoodPicker";
import { TagInput } from "@/components/shared/TagInput";

interface PropertiesPanelProps {
  date: string;
  onDateChange: (date: string) => void;
  mood: string | null;
  onMoodChange: (mood: string | null) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  disabled?: boolean;
}

export function PropertiesPanel({
  date,
  onDateChange,
  mood,
  onMoodChange,
  tags,
  onTagsChange,
  disabled,
}: PropertiesPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const summaryParts: string[] = [];
  if (date) summaryParts.push(date);
  const moodEmoji = getMoodEmoji(mood);
  if (moodEmoji) summaryParts.push(moodEmoji);
  if (tags.length > 0) summaryParts.push(tags.slice(0, 3).join(", "));

  return (
    <div className="py-2">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            expanded && "rotate-90",
          )}
        />
        <span className="font-medium">Properties</span>
        {!expanded && summaryParts.length > 0 && (
          <span className="ml-2 text-xs text-text-secondary/70 truncate">
            {summaryParts.join("  ·  ")}
          </span>
        )}
      </button>

      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-[4rem_1fr] gap-x-4 gap-y-3 items-start pt-3 pb-1 pl-5">
            <span className="text-xs text-text-secondary uppercase tracking-wide pt-1.5">
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              disabled={disabled}
              className="h-8 w-[160px] rounded-md border border-border/50 bg-transparent px-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
            />

            <span className="text-xs text-text-secondary uppercase tracking-wide pt-1">
              Mood
            </span>
            <MoodPicker value={mood} onChange={onMoodChange} disabled={disabled} />

            <span className="text-xs text-text-secondary uppercase tracking-wide pt-1.5">
              Tags
            </span>
            <TagInput
              tags={tags}
              onChange={onTagsChange}
              placeholder="Add tags..."
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
