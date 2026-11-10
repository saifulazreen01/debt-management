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
import { getDebtCategoryLabel } from "@/lib/debt-categories";
import {
  formatCurrency,
  formatDate,
  formatPaymentDueDay,
  getInterestUponMaturity,
  getInterestTypeLabel,
  getRemainingDebt,
  getTotalOwed,
  getTotalPayable,
} from "@/lib/debts";
import type { Debt } from "@/lib/generated/prisma/client";

export function DebtList({ debts }: { debts: Debt[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt detail table</CardTitle>
        <CardDescription>
          {debts.length === 0
            ? "No debts yet — remaining total stays at RM 0.00."
            : `${debts.length} loan${debts.length === 1 ? "" : "s"} with full payment and interest figures`}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {debts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Remaining {formatCurrency(0)} · Interest to maturity{" "}
            {formatCurrency(0)}
          </p>
        ) : (
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-2 py-2 font-medium">Name</th>
                <th className="px-2 py-2 font-medium">Category</th>
                <th className="px-2 py-2 font-medium">Due day</th>
                <th className="px-2 py-2 font-medium">Period</th>
                <th className="px-2 py-2 font-medium">Monthly</th>
                <th className="px-2 py-2 font-medium">Remaining</th>
                <th className="px-2 py-2 font-medium">Interest to maturity</th>
                <th className="px-2 py-2 font-medium">Total payable</th>
                <th className="px-2 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {debts.map((debt) => {
                const interestLabel = getInterestTypeLabel(debt.interestType);

                return (
                  <tr
                    key={debt.id}
                    className="border-b border-border/70 last:border-b-0"
                  >
                    <td className="px-2 py-3 align-top">
                      <p className="font-medium">{debt.name}</p>
                      {debt.interestRate != null ? (
                        <p className="text-xs text-muted-foreground">
                          {debt.interestRate}%
                          {interestLabel ? ` · ${interestLabel}` : ""}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-2 py-3 align-top">
                      {getDebtCategoryLabel(debt.category)}
                    </td>
                    <td className="px-2 py-3 align-top">
                      {formatPaymentDueDay(debt.paymentDueDay)}
                    </td>
                    <td className="px-2 py-3 align-top text-muted-foreground">
                      {formatDate(debt.startDate)} → {formatDate(debt.endDate)}
                    </td>
                    <td className="px-2 py-3 align-top">
                      {formatCurrency(debt.monthlyPayment)}
                    </td>
                    <td className="px-2 py-3 align-top">
                      <p>{formatCurrency(getRemainingDebt(debt))}</p>
                      <p className="text-xs text-muted-foreground">
                        of {formatCurrency(getTotalOwed(debt))}
                      </p>
                    </td>
                    <td className="px-2 py-3 align-top">
                      {formatCurrency(getInterestUponMaturity(debt))}
                    </td>
                    <td className="px-2 py-3 align-top">
                      {formatCurrency(getTotalPayable(debt))}
                    </td>
                    <td className="px-2 py-3 align-top">
                      <div className="flex items-center gap-1">
                        <DebtEditDialog debt={debt} />
                        <form action={deleteDebt.bind(null, debt.id)}>
                          <Button type="submit" variant="ghost" size="sm">
                            Remove
                          </Button>
                        </form>
                      </div>
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
