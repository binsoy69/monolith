"use client";

import { cn } from "@/lib/utils/cn";

const MOODS = [
  { emoji: "\u{1F60A}", value: "happy", label: "Happy" },
  { emoji: "\u{1F610}", value: "neutral", label: "Neutral" },
  { emoji: "\u{1F622}", value: "sad", label: "Sad" },
  { emoji: "\u{1F621}", value: "angry", label: "Angry" },
  { emoji: "\u{1F634}", value: "tired", label: "Tired" },
  { emoji: "\u{1F914}", value: "thinking", label: "Thinking" },
  { emoji: "\u{1F630}", value: "anxious", label: "Anxious" },
  { emoji: "\u{1F389}", value: "excited", label: "Excited" },
];

interface MoodPickerProps {
  value: string | null;
  onChange: (mood: string | null) => void;
  disabled?: boolean;
}

export function MoodPicker({ value, onChange, disabled }: MoodPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          title={mood.label}
          disabled={disabled}
          onClick={() => onChange(value === mood.value ? null : mood.value)}
          className={cn(
            "h-9 w-9 rounded-md text-lg flex items-center justify-center transition-colors",
            value === mood.value
              ? "bg-accent/20 ring-2 ring-accent"
              : "hover:bg-muted",
            disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
          )}
        >
          {mood.emoji}
        </button>
      ))}
    </div>
  );
}

export function getMoodEmoji(mood: string | null): string {
  return MOODS.find((m) => m.value === mood)?.emoji ?? "";
}

export function getMoodLabel(mood: string | null): string {
  return MOODS.find((m) => m.value === mood)?.label ?? "";
}
