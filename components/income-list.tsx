import { deleteIncome } from "@/app/actions/income";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/debts";
import { getIncomeCategoryLabel } from "@/lib/income-categories";
import { isIncomeActive } from "@/lib/income";
import type { Income } from "@/lib/generated/prisma/client";

export function IncomeList({ incomes }: { incomes: Income[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your income</CardTitle>
        <CardDescription>
          {incomes.length === 0
            ? "No income entries yet — monthly income stays at RM 0.00."
            : `${incomes.length} entr${incomes.length === 1 ? "y" : "ies"}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {incomes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Active monthly income {formatCurrency(0)}
          </p>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-2 py-2 font-medium">Name</th>
                <th className="px-2 py-2 font-medium">Category</th>
                <th className="px-2 py-2 font-medium">Monthly</th>
                <th className="px-2 py-2 font-medium">Period</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {incomes.map((income) => {
                const active = isIncomeActive(income);
                const period =
                  income.startDate || income.endDate
                    ? `${income.startDate ? formatDate(income.startDate) : "Open"} → ${
                        income.endDate ? formatDate(income.endDate) : "Ongoing"
                      }`
                    : "Ongoing";

                return (
                  <tr
                    key={income.id}
                    className="border-b border-border/70 last:border-b-0"
                  >
                    <td className="px-2 py-3 align-top font-medium">
                      {income.name}
                    </td>
                    <td className="px-2 py-3 align-top">
                      {getIncomeCategoryLabel(income.category)}
                    </td>
                    <td className="px-2 py-3 align-top">
                      {formatCurrency(income.monthlyAmount)}
                    </td>
                    <td className="px-2 py-3 align-top text-muted-foreground">
                      {period}
                    </td>
                    <td className="px-2 py-3 align-top">
                      {active ? "Active" : "Inactive"}
                    </td>
                    <td className="px-2 py-3 align-top">
                      <form action={deleteIncome.bind(null, income.id)}>
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
