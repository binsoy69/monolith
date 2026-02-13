"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  CheckCircle,
  BookOpen,
  PieChart,
  ListTodo,
  FileText,
  LayoutDashboard,
  Calendar,
  Settings,
  Search,
} from "lucide-react";

interface SearchResult {
  type: "habit" | "journal" | "transaction" | "task" | "page";
  title: string;
  id?: number;
  url: string;
  subtitle?: string;
}

const quickNavPages = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Habits", url: "/habits", icon: CheckCircle },
  { title: "Journal", url: "/journal", icon: BookOpen },
  { title: "Finance", url: "/finance", icon: PieChart },
  { title: "Vault", url: "/vault", icon: FileText },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Settings", url: "/settings", icon: Settings },
];

const typeIcons: Record<string, typeof CheckCircle> = {
  habit: CheckCircle,
  journal: BookOpen,
  transaction: PieChart,
  task: ListTodo,
};

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const router = useRouter();
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(url: string) {
    setOpen(false);
    setQuery("");
    router.push(url);
  }

  // Filter quick nav pages by query
  const filteredPages = query
    ? quickNavPages.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()),
      )
    : quickNavPages;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search across all modules..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {searching ? "Searching..." : "No results found."}
        </CommandEmpty>

        {filteredPages.length > 0 && (
          <CommandGroup heading="Pages">
            {filteredPages.map((page) => (
              <CommandItem
                key={page.url}
                onSelect={() => handleSelect(page.url)}
              >
                <page.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                {page.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.length > 0 && (
          <CommandGroup heading="Search Results">
            {results.map((result) => {
              const Icon = typeIcons[result.type] || Search;
              return (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  onSelect={() => handleSelect(result.url)}
                >
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    {result.subtitle && (
                      <span className="text-xs text-muted-foreground">
                        {result.subtitle}
                      </span>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
