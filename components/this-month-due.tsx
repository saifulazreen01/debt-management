import Link from "next/link";
import { CalendarDaysIcon } from "lucide-react";
import { GuideAvatar } from "@/components/journey/guide-character";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatCurrency,
  formatDate,
  type DebtInsight,
} from "@/lib/debts";
import { JOURNEY_CHARACTERS } from "@/lib/journey-characters";

export function ThisMonthDue({
  amount,
  income,
  capability,
  upcoming,
  showReviewLink = true,
}: {
  amount: number;
  income: number;
  capability: number;
  upcoming: DebtInsight[];
  showReviewLink?: boolean;
}) {
  const nextDue = upcoming.find((item) => item.nextDueDate)?.nextDueDate;
  const activeCount = upcoming.filter((item) => item.dueThisMonth > 0).length;
  const guide =
    amount <= 0 ? JOURNEY_CHARACTERS.aiman : JOURNEY_CHARACTERS.ria;

  return (
    <Card className="glass-panel-strong overflow-hidden border-primary/20 bg-gradient-to-br from-white/55 via-white/35 to-primary/15 dark:from-white/10 dark:via-white/5 dark:to-primary/20">
      <CardHeader className="gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <GuideAvatar
            character={guide}
            mood={amount > 0 ? "focused" : "empty"}
            size="lg"
          />
          <div className="grid gap-2">
            <CardDescription className="text-sm text-primary">
              {guide.name} checked this month&apos;s debt payment
            </CardDescription>
            <CardTitle className="font-mono text-4xl font-semibold tracking-tight sm:text-5xl">
              {formatCurrency(amount)}
            </CardTitle>
            <p className="max-w-xl text-sm text-muted-foreground">
              {amount > 0
                ? "Set this aside so repayments do not surprise you mid-month."
                : "No repayment pressure this month — nice breathing room."}
              {nextDue
                ? ` Next due date coming up: ${formatDate(nextDue)}.`
                : ""}
            </p>
          </div>
        </div>
        {showReviewLink ? (
          <Button render={<Link href="/debts" />}>Review debts</Button>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-3 border-t border-white/35 bg-white/25 p-4 backdrop-blur-md sm:grid-cols-3 dark:border-white/10 dark:bg-white/5">
        <div>
          <p className="text-xs text-muted-foreground">Monthly income</p>
          <p className="font-mono text-lg font-medium tabular-nums">
            {formatCurrency(income)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Left after debt</p>
          <p className="font-mono text-lg font-medium tabular-nums">
            {formatCurrency(capability)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Debts due this month</p>
          <p className="flex items-center gap-1.5 text-lg font-medium">
            <CalendarDaysIcon className="size-4 text-muted-foreground" />
            {activeCount}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
