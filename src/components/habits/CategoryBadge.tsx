"use client";

import { Badge } from "@/components/ui/badge";

interface CategoryBadgeProps {
  name: string;
  color: string;
}

export function CategoryBadge({ name, color }: CategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="text-xs font-medium"
      style={{ borderColor: color, color }}
    >
      {name}
    </Badge>
  );
}
