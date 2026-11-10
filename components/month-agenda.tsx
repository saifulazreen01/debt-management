import Link from "next/link";
import { GuideAvatar } from "@/components/journey/guide-character";
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
  type DebtInsight,
} from "@/lib/debts";
import { JOURNEY_CHARACTERS } from "@/lib/journey-characters";

export function MonthAgenda({ insights }: { insights: DebtInsight[] }) {
  const dueThisMonth = insights.filter((item) => item.dueThisMonth > 0);
  const guide =
    dueThisMonth.length === 0
      ? JOURNEY_CHARACTERS.nuri
      : JOURNEY_CHARACTERS.ria;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <GuideAvatar
            character={guide}
            mood={dueThisMonth.length === 0 ? "celebrate" : "focused"}
            size="md"
          />
          <div className="grid gap-1">
            <CardDescription className="text-primary">
              {guide.name} · this month&apos;s agenda
            </CardDescription>
            <CardTitle className="font-heading text-xl font-semibold tracking-tight">
              {dueThisMonth.length === 0
                ? "Clear calendar — no payments due"
                : `${dueThisMonth.length} payment${dueThisMonth.length === 1 ? "" : "s"} lined up`}
            </CardTitle>
          </div>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/debts" />}>
          Open debts
        </Button>
      </CardHeader>
      <CardContent>
        {dueThisMonth.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Enjoy the calm. If a new loan starts, add it so we can plan the next
            due dates together.
          </p>
        ) : (
          <ul className="divide-y divide-border/70">
            {dueThisMonth.map((item) => (
              <li
                key={item.debt.id}
                className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 grid gap-0.5">
                  <p className="truncate font-medium">{item.debt.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getDebtCategoryLabel(item.debt.category)}
                    {item.nextDueDate
                      ? ` · due ${formatDate(item.nextDueDate)}`
                      : ""}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-sm font-semibold tabular-nums">
                  {formatCurrency(item.dueThisMonth)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
