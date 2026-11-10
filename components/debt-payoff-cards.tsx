import { deleteDebt } from "@/app/actions/debts";
import { DebtEditDialog } from "@/components/form/debt-edit-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDebtCategoryLabel } from "@/lib/debt-categories";
import {
  formatCurrency,
  formatDate,
  formatPaymentDueDay,
  getInterestTypeLabel,
  type DebtInsight,
} from "@/lib/debts";

export function DebtPayoffCards({ insights }: { insights: DebtInsight[] }) {
  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debt payoff board</CardTitle>
          <CardDescription>
            Each loan will show how much to pay this month, when it settles, and
            remaining interest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No debts yet — add a loan to start tracking payoff clarity.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Debt payoff board
        </h2>
        <p className="text-sm text-muted-foreground">
          Pay this month, settle date, and interest left for each loan.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {insights.map((item) => {
          const interestLabel = getInterestTypeLabel(item.debt.interestType);
          const dueSoon =
            item.nextDueDate !== null &&
            item.nextDueDate.getTime() - Date.now() <= 7 * 24 * 60 * 60 * 1000;

          return (
            <Card key={item.debt.id} className="overflow-hidden">
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid gap-1">
                    <CardTitle className="text-lg leading-snug">
                      {item.debt.name}
                    </CardTitle>
                    <CardDescription>
                      {getDebtCategoryLabel(item.debt.category)}
                      {item.debt.interestRate != null
                        ? ` · ${item.debt.interestRate}%${interestLabel ? ` ${interestLabel.toLowerCase()}` : ""}`
                        : ""}
                    </CardDescription>
                  </div>
                  <div className="rounded-lg border border-white/40 bg-white/35 px-2.5 py-1 text-right backdrop-blur-md dark:border-white/10 dark:bg-white/10">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      This month
                    </p>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(item.dueThisMonth)}
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Paid down</span>
                    <span className="font-medium tabular-nums">
                      {item.progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={item.progress} className="w-full" />
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/35 bg-white/30 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs text-muted-foreground">Still owing</p>
                    <p className="mt-1 font-semibold tabular-nums">
                      {formatCurrency(item.remaining)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/35 bg-white/30 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs text-muted-foreground">
                      Interest left
                    </p>
                    <p className="mt-1 font-semibold tabular-nums">
                      {formatCurrency(item.remainingInterest)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/35 bg-white/30 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs text-muted-foreground">Settle by</p>
                    <p className="mt-1 font-semibold">
                      {formatDate(item.settleDate)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.monthsLeft} month
                      {item.monthsLeft === 1 ? "" : "s"} left
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/35 bg-white/30 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs text-muted-foreground">Next due</p>
                    <p className="mt-1 font-semibold">
                      {item.nextDueDate
                        ? formatDate(item.nextDueDate)
                        : "—"}
                    </p>
                    <p
                      className={`mt-0.5 text-xs ${dueSoon ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"}`}
                    >
                      Due day {formatPaymentDueDay(item.debt.paymentDueDay)}
                      {dueSoon ? " · due soon" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <DebtEditDialog debt={item.debt} />
                  <form action={deleteDebt.bind(null, item.debt.id)}>
                    <Button type="submit" variant="ghost" size="sm">
                      Remove
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
