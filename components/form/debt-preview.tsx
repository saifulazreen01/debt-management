import { formatCurrency } from "@/lib/debts";
import type { DebtCostPreview } from "@/lib/debts";

export function DebtPreview({
  preview,
  matchLabel,
}: {
  preview: DebtCostPreview | null;
  matchLabel?: string | null;
}) {
  if (!preview) {
    return (
      <div className="rounded-xl border border-dashed border-white/40 bg-white/20 p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5">
        Fill loan amount, installment or rate, and the loan period to see monthly
        payment, total interest, and fees.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/40 bg-white/30 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-medium uppercase tracking-wide text-primary">
        Cost preview
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Monthly payment</p>
          <p className="font-mono text-lg font-semibold tabular-nums">
            {formatCurrency(preview.monthlyPayment)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total interest / profit</p>
          <p className="font-mono text-lg font-semibold tabular-nums">
            {formatCurrency(preview.totalInterest)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Upfront fees</p>
          <p className="font-mono text-lg font-semibold tabular-nums">
            {formatCurrency(preview.fee)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total borrowing cost</p>
          <p className="font-mono text-lg font-semibold tabular-nums">
            {formatCurrency(preview.totalCost)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total payable</p>
          <p className="font-mono text-sm font-medium tabular-nums">
            {formatCurrency(preview.totalPayable)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Est. net disbursed</p>
          <p className="font-mono text-sm font-medium tabular-nums">
            {formatCurrency(preview.netDisbursed)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {preview.months} month{preview.months === 1 ? "" : "s"}
        {preview.estimatedAnnualRate != null
          ? ` · ~${preview.estimatedAnnualRate.toFixed(2)}% p.a.`
          : ""}
        . Fees like stamp duty / wakalah are treated as first-phase deductions.
      </p>
      {matchLabel ? (
        <p className="mt-2 text-xs font-medium text-primary">{matchLabel}</p>
      ) : null}
    </div>
  );
}
