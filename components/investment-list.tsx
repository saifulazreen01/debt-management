import { deleteInvestment } from "@/app/actions/investments";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/debts";
import { getInvestmentCategoryLabel } from "@/lib/investment-categories";
import { formatContributionLabel } from "@/lib/investments";
import type { Investment } from "@/lib/generated/prisma/client";

export function InvestmentList({
  investments,
  monthlyIncome = 0,
}: {
  investments: Investment[];
  monthlyIncome?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your investments</CardTitle>
        <CardDescription>
          {investments.length === 0
            ? "No investments yet — totals stay at RM 0.00."
            : `${investments.length} investment${investments.length === 1 ? "" : "s"}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {investments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Total invested {formatCurrency(0)}
          </p>
        ) : (
          investments.map((investment) => (
            <div
              key={investment.id}
              className="flex flex-col gap-3 border-b border-border/70 py-3 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="grid gap-1">
                <p className="font-medium">{investment.name}</p>
                <p className="text-sm text-muted-foreground">
                  {getInvestmentCategoryLabel(investment.category)}
                </p>
                <p className="font-mono text-sm font-medium">
                  {formatCurrency(investment.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatContributionLabel(investment, monthlyIncome)}
                </p>
              </div>
              <form action={deleteInvestment.bind(null, investment.id)}>
                <Button type="submit" variant="ghost" size="sm">
                  Remove
                </Button>
              </form>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
