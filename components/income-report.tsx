import type { IncomeCategoryRow } from "@/lib/income";
import { formatCurrency } from "@/lib/debts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function IncomeReport({ rows }: { rows: IncomeCategoryRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income by category</CardTitle>
        <CardDescription>
          Active monthly amount for each income category, including zeros.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.map((row) => (
          <div
            key={row.category}
            className="grid gap-1 border-b border-border/70 pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[1.4fr_1fr_1fr] sm:items-end"
          >
            <div>
              <p className="font-medium">{row.label}</p>
              <p className="text-sm text-muted-foreground">
                {row.count} entr{row.count === 1 ? "y" : "ies"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active monthly</p>
              <p className="text-sm font-medium">
                {formatCurrency(row.monthlyAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Entries</p>
              <p className="text-sm font-medium">{row.count}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
