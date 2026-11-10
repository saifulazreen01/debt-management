import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/debts";
import type { InvestmentYear } from "@/lib/investment-projection";
import { cn } from "cn";

export function InvestmentProjectionTable({
  years,
  title = "Projection by year",
  description,
  className,
  emptyMessage = "Enter investment details to see yearly growth.",
  showDividend = false,
}: {
  years: InvestmentYear[];
  title?: string;
  description?: string;
  className?: string;
  emptyMessage?: string;
  showDividend?: boolean;
}) {
  const hasDividend = showDividend || years.some((row) => row.dividend > 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {years.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <table
            className={cn(
              "w-full border-collapse text-left text-sm",
              hasDividend ? "min-w-[640px]" : "min-w-[520px]"
            )}
          >
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-2 py-2 font-medium">Year</th>
                <th className="px-2 py-2 font-medium">Contributed</th>
                <th className="px-2 py-2 font-medium">Growth</th>
                {hasDividend ? (
                  <th className="px-2 py-2 font-medium">Dividend</th>
                ) : null}
                <th className="px-2 py-2 font-medium">Balance</th>
                <th className="px-2 py-2 font-medium">Total wealth</th>
              </tr>
            </thead>
            <tbody>
              {years.map((row) => (
                <tr
                  key={row.year}
                  className="border-b border-border/70 last:border-b-0"
                >
                  <td className="px-2 py-2.5 align-top font-medium">
                    Year {row.year}
                  </td>
                  <td className="px-2 py-2.5 align-top font-mono tabular-nums">
                    {formatCurrency(row.contributed)}
                  </td>
                  <td className="px-2 py-2.5 align-top font-mono tabular-nums">
                    {formatCurrency(row.growth)}
                  </td>
                  {hasDividend ? (
                    <td className="px-2 py-2.5 align-top font-mono tabular-nums">
                      {formatCurrency(row.dividend)}
                    </td>
                  ) : null}
                  <td className="px-2 py-2.5 align-top font-mono tabular-nums">
                    {formatCurrency(row.endingBalance)}
                  </td>
                  <td className="px-2 py-2.5 align-top font-mono tabular-nums">
                    {formatCurrency(row.totalWealth)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border">
                <td className="px-2 py-2.5 font-medium">Total</td>
                <td className="px-2 py-2.5 font-mono text-sm font-semibold tabular-nums">
                  {formatCurrency(
                    years.reduce((sum, row) => sum + row.contributed, 0)
                  )}
                </td>
                <td className="px-2 py-2.5 font-mono text-sm font-semibold tabular-nums">
                  {formatCurrency(
                    years.reduce((sum, row) => sum + row.growth, 0)
                  )}
                </td>
                {hasDividend ? (
                  <td className="px-2 py-2.5 font-mono text-sm font-semibold tabular-nums">
                    {formatCurrency(
                      years.reduce((sum, row) => sum + row.dividend, 0)
                    )}
                  </td>
                ) : null}
                <td className="px-2 py-2.5 font-mono text-sm tabular-nums text-muted-foreground">
                  —
                </td>
                <td className="px-2 py-2.5 font-mono text-sm font-semibold tabular-nums">
                  {formatCurrency(years.at(-1)?.totalWealth ?? 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
