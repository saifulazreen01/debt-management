import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AmortizationYear } from "@/lib/amortization";
import { formatCurrency } from "@/lib/debts";
import { cn } from "cn";

export function AmortizationTable({
  years,
  title = "Amortization by year",
  description,
  className,
  emptyMessage = "Enter loan details to see yearly payments.",
}: {
  years: AmortizationYear[];
  title?: string;
  description?: string;
  className?: string;
  emptyMessage?: string;
}) {
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
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-2 py-2 font-medium">Year</th>
                <th className="px-2 py-2 font-medium">Rate</th>
                <th className="px-2 py-2 font-medium">Paid</th>
                <th className="px-2 py-2 font-medium">Principal</th>
                <th className="px-2 py-2 font-medium">Interest</th>
                <th className="px-2 py-2 font-medium">Balance left</th>
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
                    {row.ratePercent.toFixed(2)}%
                  </td>
                  <td className="px-2 py-2.5 align-top font-mono tabular-nums">
                    {formatCurrency(row.payment)}
                  </td>
                  <td className="px-2 py-2.5 align-top font-mono tabular-nums">
                    {formatCurrency(row.principal)}
                  </td>
                  <td className="px-2 py-2.5 align-top font-mono tabular-nums">
                    {formatCurrency(row.interest)}
                  </td>
                  <td className="px-2 py-2.5 align-top font-mono tabular-nums">
                    {formatCurrency(row.endingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border">
                <td className="px-2 py-2.5 font-medium" colSpan={2}>
                  Total
                </td>
                <td className="px-2 py-2.5 font-mono text-sm font-semibold tabular-nums">
                  {formatCurrency(
                    years.reduce((sum, row) => sum + row.payment, 0)
                  )}
                </td>
                <td className="px-2 py-2.5 font-mono text-sm font-semibold tabular-nums">
                  {formatCurrency(
                    years.reduce((sum, row) => sum + row.principal, 0)
                  )}
                </td>
                <td className="px-2 py-2.5 font-mono text-sm font-semibold tabular-nums">
                  {formatCurrency(
                    years.reduce((sum, row) => sum + row.interest, 0)
                  )}
                </td>
                <td
                  className={cn(
                    "px-2 py-2.5 font-mono text-sm tabular-nums text-muted-foreground"
                  )}
                >
                  —
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
