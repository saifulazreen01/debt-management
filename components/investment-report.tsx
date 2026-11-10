import type { InvestmentCategoryRow } from "@/lib/investments";
import { formatCurrency } from "@/lib/debts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function InvestmentReport({ rows }: { rows: InvestmentCategoryRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Investments by category</CardTitle>
        <CardDescription>
          Current balance and planned monthly contribution.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.map((row) => (
          <div
            key={row.category}
            className="grid gap-1 border-b border-border/70 pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[1.2fr_1fr_1fr] sm:items-end"
          >
            <div>
              <p className="font-medium">{row.label}</p>
              <p className="text-sm text-muted-foreground">
                {row.count} item{row.count === 1 ? "" : "s"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="font-mono text-sm font-medium">
                {formatCurrency(row.amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly add</p>
              <p className="font-mono text-sm font-medium">
                {formatCurrency(row.monthlyContribution)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
