import Link from "next/link";
import {
  PiggyBankIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/debts";
import { formatDsrPercent, type DsrSummary } from "@/lib/income";

const levelTone: Record<DsrSummary["level"], string> = {
  unknown: "text-muted-foreground",
  comfortable: "text-emerald-700 dark:text-emerald-400",
  manageable: "text-foreground",
  stretched: "text-amber-700 dark:text-amber-400",
  high: "text-destructive",
};

export function MonthSnapshot({
  income,
  debtPayment,
  capability,
  dsr,
  remainingDebt,
  totalInvestments,
}: {
  income: number;
  debtPayment: number;
  capability: number;
  dsr: DsrSummary;
  remainingDebt: number;
  totalInvestments: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <WalletIcon className="size-3.5" />
            Income this month
          </CardDescription>
          <CardTitle className="font-mono text-2xl font-semibold tracking-tight">
            {formatCurrency(income)}
          </CardTitle>
          <Link
            href="/incomes"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Manage incomes
          </Link>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Debt out this month</CardDescription>
          <CardTitle className="font-mono text-2xl font-semibold tracking-tight">
            {formatCurrency(debtPayment)}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Leaves {formatCurrency(capability)} after repayments
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>DSR this month</CardDescription>
          <CardTitle
            className={`font-mono text-2xl font-semibold tracking-tight ${levelTone[dsr.level]}`}
          >
            {formatDsrPercent(dsr.dsrPercent)}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{dsr.label}</p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <TrendingUpIcon className="size-3.5" />
            Balances
          </CardDescription>
          <CardTitle className="grid gap-1 text-base font-semibold tracking-tight">
            <span className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                <PiggyBankIcon className="size-3.5" />
                Debt left
              </span>
              <span className="font-mono text-sm">
                {formatCurrency(remainingDebt)}
              </span>
            </span>
            <span className="flex items-center justify-between gap-2">
              <span className="text-xs font-normal text-muted-foreground">
                Investments
              </span>
              <span className="font-mono text-sm">
                {formatCurrency(totalInvestments)}
              </span>
            </span>
          </CardTitle>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <Link
              href="/debts"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Debts
            </Link>
            <Link
              href="/investments"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Investments
            </Link>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
