"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { MonthlyPaymentPoint } from "@/lib/debts";
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
  total: {
    label: "Monthly payment",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function DebtChart({
  data,
  className,
}: {
  data: MonthlyPaymentPoint[];
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Near-term repayments</CardTitle>
        <CardDescription>
          Upcoming monthly debt totals from this month forward.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[16/10] w-full sm:aspect-[2/1]">
          <BarChart accessibilityLayer data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={72}
              domain={[0, "auto"]}
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-MY", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(Number(value))
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(Number(value))}
                />
              }
            />
            <Bar
              dataKey="total"
              fill="var(--color-total)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
