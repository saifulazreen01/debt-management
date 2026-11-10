import { deleteDebtPayment } from "@/app/actions/payments";
import { PaymentFormDialog } from "@/components/form/payment-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/debts";
import type { Debt } from "@/lib/generated/prisma/client";
import {
  countExtraPayments,
  formatPeriodLabel,
  getPaymentInsights,
  type DebtPaymentWithDebt,
} from "@/lib/payments";
import { cn } from "cn";

export function PaymentLog({
  debts,
  payments,
}: {
  debts: Debt[];
  payments: DebtPaymentWithDebt[];
}) {
  const insights = getPaymentInsights(payments);
  const extraCount = countExtraPayments(insights);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="grid gap-1">
          <CardTitle>Payment log</CardTitle>
          <CardDescription>
            {payments.length === 0
              ? "Record each month's payment date and amount to spot fees, penalties, or late interest."
              : `${payments.length} payment${payments.length === 1 ? "" : "s"} logged${
                  extraCount > 0
                    ? ` · ${extraCount} with extra charge detected`
                    : ""
                }`}
          </CardDescription>
        </div>
        <PaymentFormDialog debts={debts} />
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No payments logged yet. After you pay a debt, key in the date and
            amount here.
          </p>
        ) : (
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-2 py-2 font-medium">Debt</th>
                <th className="px-2 py-2 font-medium">Period</th>
                <th className="px-2 py-2 font-medium">Due</th>
                <th className="px-2 py-2 font-medium">Paid on</th>
                <th className="px-2 py-2 font-medium">Expected</th>
                <th className="px-2 py-2 font-medium">Paid</th>
                <th className="px-2 py-2 font-medium">Difference</th>
                <th className="px-2 py-2 font-medium">Signal</th>
                <th className="px-2 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {insights.map((insight) => {
                const { payment, difference, isExtra, isLate, isShort, summary } =
                  insight;

                return (
                  <tr
                    key={payment.id}
                    className={cn(
                      "border-b border-border/70 last:border-b-0",
                      isExtra && "bg-amber-500/10"
                    )}
                  >
                    <td className="px-2 py-3 align-top">
                      <p className="font-medium">{payment.debt.name}</p>
                      {payment.notes ? (
                        <p className="text-xs text-muted-foreground">
                          {payment.notes}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-2 py-3 align-top">
                      {formatPeriodLabel(
                        payment.periodYear,
                        payment.periodMonth
                      )}
                    </td>
                    <td className="px-2 py-3 align-top">
                      {formatDate(insight.dueDate)}
                    </td>
                    <td className="px-2 py-3 align-top">
                      <p>{formatDate(payment.paidAt)}</p>
                      {isLate ? (
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          After due date
                        </p>
                      ) : null}
                    </td>
                    <td className="px-2 py-3 align-top font-mono tabular-nums">
                      {formatCurrency(payment.expectedAmount)}
                    </td>
                    <td className="px-2 py-3 align-top font-mono tabular-nums">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td
                      className={cn(
                        "px-2 py-3 align-top font-mono tabular-nums",
                        isExtra && "font-semibold text-amber-700 dark:text-amber-300",
                        isShort && "text-rose-700 dark:text-rose-300"
                      )}
                    >
                      {difference > 0 ? "+" : ""}
                      {formatCurrency(difference)}
                    </td>
                    <td className="px-2 py-3 align-top">
                      <p
                        className={cn(
                          "text-xs leading-relaxed",
                          isExtra || isLate
                            ? "text-amber-800 dark:text-amber-200"
                            : "text-muted-foreground"
                        )}
                      >
                        {summary}
                      </p>
                    </td>
                    <td className="px-2 py-3 align-top">
                      <form action={deleteDebtPayment.bind(null, payment.id)}>
                        <Button type="submit" variant="ghost" size="sm">
                          Remove
                        </Button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
