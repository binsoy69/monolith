"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Palette } from "lucide-react";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEME_OPTIONS = [
  { id: "light", name: "Light" },
  { id: "dark", name: "Dark" },
  { id: "tokyo-night", name: "Tokyo Night" },
  { id: "monokai", name: "Monokai" },
  { id: "abyss", name: "Abyss" },
  { id: "dracula", name: "Dracula" },
  { id: "one-dark-pro", name: "One Dark Pro" },
  { id: "nord", name: "Nord" },
];

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-bg-elevated px-6">
      <div className="flex items-center">
        {/* Breadcrumbs or Title could go here */}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {THEME_OPTIONS.slice(0, 2).map((t) => (
              <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id)}>
                {t.id === "light" ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                <span>{t.name}</span>
                {mounted && theme === t.id && <span className="ml-auto text-accent text-xs">&#10003;</span>}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {THEME_OPTIONS.slice(2).map((t) => (
              <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id)}>
                <Palette className="mr-2 h-4 w-4" />
                <span>{t.name}</span>
                {mounted && theme === t.id && <span className="ml-auto text-accent text-xs">&#10003;</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
