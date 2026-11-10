import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/debts";
import {
  formatDsrPercent,
  type DsrSummary,
} from "@/lib/income";

const levelTone: Record<DsrSummary["level"], string> = {
  unknown: "text-muted-foreground",
  comfortable: "text-emerald-700 dark:text-emerald-400",
  manageable: "text-foreground",
  stretched: "text-amber-700 dark:text-amber-400",
  high: "text-destructive",
};

export function DsrCard({
  summary,
  monthlyIncome,
  monthlyDebtPayment,
}: {
  summary: DsrSummary;
  monthlyIncome: number;
  monthlyDebtPayment: number;
}) {
  return (
    <Card className="sm:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardDescription>DSR & capability to pay</CardDescription>
        <CardTitle className="text-3xl tracking-tight">
          <span className={levelTone[summary.level]}>
            {formatDsrPercent(summary.dsrPercent)}
          </span>
          <span className="ml-3 text-base font-medium text-muted-foreground">
            {summary.label}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Monthly debt payment</p>
          <p className="text-sm font-medium">
            {formatCurrency(monthlyDebtPayment)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Monthly income</p>
          <p className="text-sm font-medium">{formatCurrency(monthlyIncome)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Capability to pay</p>
          <p className="text-sm font-medium">
            {formatCurrency(summary.capabilityToPay)}
          </p>
          <p className="text-xs text-muted-foreground">
            Income left after debt repayments
          </p>
        </div>
        <p className="text-sm text-muted-foreground sm:col-span-3">
          DSR = monthly debt payment ÷ monthly income. {summary.guidance}
        </p>
      </CardContent>
    </Card>
  );
}
