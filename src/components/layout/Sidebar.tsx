"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  CheckCircle,
  BookOpen,
  PieChart,
  FileText,
  ListTodo,
  Calendar,
  Settings,
  Pin,
  PinOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Habits", href: "/habits", icon: CheckCircle },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Finance", href: "/finance", icon: PieChart },
  { name: "Vault", href: "/vault", icon: FileText },
  { name: "Tasks", href: "/tasks", icon: ListTodo },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isPinned, setIsPinned] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const isExpanded = isPinned || isHovered;

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setIsPinned((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group flex flex-col border-r bg-bg-elevated transition-all duration-300 ease-in-out",
          isExpanded ? "w-64" : "w-16",
        )}
      >
        <div className="flex h-14 items-center border-b px-3">
          {isExpanded ? (
            <>
              <span className="font-semibold text-lg tracking-tight px-2 whitespace-nowrap">
                Monolith
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-7 w-7"
                onClick={() => setIsPinned(!isPinned)}
                aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                {isPinned ? (
                  <Pin className="h-3.5 w-3.5 text-accent" />
                ) : (
                  <PinOff className="h-3.5 w-3.5 text-text-secondary" />
                )}
              </Button>
            </>
          ) : (
            <span className="mx-auto font-bold text-lg text-accent">M</span>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent/10 text-accent border-l-2 border-accent"
                    : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary",
                  !isExpanded && "justify-center px-2",
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isExpanded && "mr-3")} />
                {isExpanded && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );

            if (!isExpanded) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
