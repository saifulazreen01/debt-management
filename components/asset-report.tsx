import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AssetCategoryRow } from "@/lib/assets";
import { formatCurrency } from "@/lib/debts";

export function AssetReport({
  rows,
  yearRows,
}: {
  rows: AssetCategoryRow[];
  yearRows: {
    year: number;
    purchaseTotal: number;
    worthTotal: number;
    count: number;
  }[];
}) {
  const activeCategories = rows.filter((row) => row.count > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>By category</CardTitle>
          <CardDescription>
            Purchase totals versus latest recorded worth.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {activeCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            activeCategories.map((row) => (
              <div
                key={row.category}
                className="flex items-start justify-between gap-3 border-b border-border/70 pb-3 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{row.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.count} item{row.count === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium">
                    {formatCurrency(row.currentWorth)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    bought {formatCurrency(row.purchaseTotal)}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By year</CardTitle>
          <CardDescription>
            Yearly worth snapshots and purchase-year totals.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {yearRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No yearly data yet.</p>
          ) : (
            yearRows.map((row) => (
              <div
                key={row.year}
                className="flex items-start justify-between gap-3 border-b border-border/70 pb-3 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{row.year}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.count} worth record{row.count === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium">
                    {formatCurrency(row.worthTotal)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    purchases {formatCurrency(row.purchaseTotal)}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
