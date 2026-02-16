"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";

interface CategoryData {
  categoryId: number;
  name: string;
  color: string;
  total: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No expense data
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by value descending
  const sorted = [...data].sort((a, b) => b.total - a.total);
  const total = sorted.reduce((sum, d) => sum + d.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sorted}
                dataKey="total"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                strokeWidth={0}
              >
                {sorted.map((entry) => (
                  <Cell key={entry.categoryId} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const item = payload[0].payload as CategoryData;
                  const pct = total > 0 ? ((item.total / total) * 100).toFixed(1) : "0";
                  return (
                    <div className="rounded-lg border bg-bg-elevated px-3 py-2 shadow-md">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.total)} ({pct}%)
                      </p>
                    </div>
                  );
                }}
              />
              {/* Center label */}
              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-text-primary text-lg font-bold"
              >
                {formatCurrency(total)}
              </text>
              <text
                x="50%"
                y="56%"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-text-secondary text-[11px]"
              >
                Total
              </text>
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
            {sorted.map((entry) => {
              const pct = total > 0 ? ((entry.total / total) * 100).toFixed(0) : "0";
              return (
                <div key={entry.categoryId} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-text-secondary">{entry.name}</span>
                  <span className="text-text-primary font-medium">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
