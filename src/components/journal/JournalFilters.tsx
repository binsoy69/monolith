"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MOODS = [
  { value: "happy", label: "Happy \u{1F60A}" },
  { value: "neutral", label: "Neutral \u{1F610}" },
  { value: "sad", label: "Sad \u{1F622}" },
  { value: "angry", label: "Angry \u{1F621}" },
  { value: "tired", label: "Tired \u{1F634}" },
  { value: "thinking", label: "Thinking \u{1F914}" },
  { value: "anxious", label: "Anxious \u{1F630}" },
  { value: "excited", label: "Excited \u{1F389}" },
];

interface JournalFiltersProps {
  mood: string;
  tag: string;
  tags: string[];
  onMoodChange: (mood: string) => void;
  onTagChange: (tag: string) => void;
}

export function JournalFilters({
  mood,
  tag,
  tags,
  onMoodChange,
  onTagChange,
}: JournalFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={mood} onValueChange={onMoodChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All moods" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All moods</SelectItem>
          {MOODS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={tag} onValueChange={onTagChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All tags" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tags</SelectItem>
          {tags.map((t) => (
            <SelectItem key={t} value={t}>
              #{t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
