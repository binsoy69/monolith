"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils/cn";
import { Check } from "lucide-react";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

const THEMES = [
  {
    id: "light",
    name: "Light",
    colors: { bg: "#ffffff", secondary: "#f8f9fa", accent: "#6366f1", text: "#111827" },
  },
  {
    id: "dark",
    name: "Dark",
    colors: { bg: "#0a0a0a", secondary: "#171717", accent: "#818cf8", text: "#ededed" },
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    colors: { bg: "#1a1b26", secondary: "#24283b", accent: "#7aa2f7", text: "#c0caf5" },
  },
  {
    id: "monokai",
    name: "Monokai",
    colors: { bg: "#272822", secondary: "#1e1f1c", accent: "#f92672", text: "#f8f8f2" },
  },
  {
    id: "abyss",
    name: "Abyss",
    colors: { bg: "#000c18", secondary: "#051336", accent: "#6688cc", text: "#bbbbbb" },
  },
  {
    id: "dracula",
    name: "Dracula",
    colors: { bg: "#282a36", secondary: "#21222c", accent: "#bd93f9", text: "#f8f8f2" },
  },
  {
    id: "one-dark-pro",
    name: "One Dark Pro",
    colors: { bg: "#282c34", secondary: "#21252b", accent: "#61afef", text: "#abb2bf" },
  },
  {
    id: "nord",
    name: "Nord",
    colors: { bg: "#2e3440", secondary: "#3b4252", accent: "#88c0d0", text: "#eceff4" },
  },
];

export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 h-[200px]" />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {THEMES.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              "relative flex flex-col rounded-lg border p-3 text-left transition-all hover:scale-[1.02]",
              isActive
                ? "border-accent ring-2 ring-accent/30"
                : "border-border hover:border-text-secondary",
            )}
          >
            {isActive && (
              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                <Check className="h-3 w-3" style={{ color: t.colors.bg }} />
              </div>
            )}
            {/* Color preview */}
            <div
              className="w-full h-16 rounded-md mb-2 flex overflow-hidden"
              style={{ backgroundColor: t.colors.bg }}
            >
              <div className="w-1/4 h-full" style={{ backgroundColor: t.colors.secondary }} />
              <div className="flex-1 flex flex-col justify-center gap-1 px-2">
                <div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: t.colors.text, opacity: 0.6 }} />
                <div className="h-1.5 w-1/2 rounded-full" style={{ backgroundColor: t.colors.accent }} />
                <div className="h-1.5 w-2/3 rounded-full" style={{ backgroundColor: t.colors.text, opacity: 0.3 }} />
              </div>
            </div>
            <span className="text-xs font-medium">{t.name}</span>
          </button>
        );
      })}
    </div>
  );
}
