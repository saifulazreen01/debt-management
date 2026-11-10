"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { CategoryReportRow } from "@/lib/debts";
import { formatCurrency } from "@/lib/debts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  remaining: {
    label: "Remaining",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function CategoryReport({ rows }: { rows: CategoryReportRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>By category</CardTitle>
        <CardDescription>
          Every debt category, including zeros when empty.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
          <BarChart
            accessibilityLayer
            data={rows}
            layout="vertical"
            margin={{ left: 8, right: 8 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              domain={[0, "auto"]}
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-MY", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(Number(value))
              }
            />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(Number(value))}
                />
              }
            />
            <Bar
              dataKey="remaining"
              fill="var(--color-remaining)"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ChartContainer>

        <div className="grid gap-3">
          {rows.map((row) => (
            <div
              key={row.category}
              className="grid gap-1 border-b border-border/70 pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))] sm:items-end"
            >
              <div>
                <p className="font-medium">{row.label}</p>
                <p className="text-sm text-muted-foreground">
                  {row.count} debt{row.count === 1 ? "" : "s"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="text-sm font-medium">
                  {formatCurrency(row.remaining)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly</p>
                <p className="text-sm font-medium">
                  {formatCurrency(row.monthlyPayment)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total owed</p>
                <p className="text-sm font-medium">
                  {formatCurrency(row.totalOwed)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
