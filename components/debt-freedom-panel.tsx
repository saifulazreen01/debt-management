import { FlagIcon, PercentIcon, TimerIcon } from "lucide-react";
import { GuideAvatar } from "@/components/journey/guide-character";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/debts";
import { formatDsrPercent, type DsrSummary } from "@/lib/income";
import { JOURNEY_CHARACTERS } from "@/lib/journey-characters";

const levelTone: Record<DsrSummary["level"], string> = {
  unknown: "text-muted-foreground",
  comfortable: "text-emerald-700 dark:text-emerald-400",
  manageable: "text-foreground",
  stretched: "text-amber-700 dark:text-amber-400",
  high: "text-destructive",
};

export function DebtFreedomPanel({
  remainingDebt,
  remainingInterest,
  freedomDate,
  monthsToFreedom,
  progress,
  dsr,
}: {
  remainingDebt: number;
  remainingInterest: number;
  freedomDate: Date | null;
  monthsToFreedom: number;
  progress: number;
  dsr: DsrSummary;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardHeader>
          <div className="mb-2 flex items-center gap-3">
            <GuideAvatar
              character={
                progress >= 60
                  ? JOURNEY_CHARACTERS.nuri
                  : JOURNEY_CHARACTERS.tok
              }
              mood={progress >= 60 ? "celebrate" : "calm"}
              size="sm"
            />
            <CardDescription>
              {(progress >= 60
                ? JOURNEY_CHARACTERS.nuri
                : JOURNEY_CHARACTERS.tok
              ).name}{" "}
              · path to debt-free
            </CardDescription>
          </div>
          <CardTitle className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {freedomDate
              ? `Settle by ${formatDate(freedomDate)}`
              : "No active debt to settle"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {freedomDate
              ? `About ${monthsToFreedom} month${monthsToFreedom === 1 ? "" : "s"} left if you keep current monthly payments.`
              : "Add debts to see your payoff timeline."}
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payoff progress</span>
              <span className="font-medium tabular-nums">
                {progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/35 bg-white/30 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TimerIcon className="size-3.5" />
                Still owing
              </p>
              <p className="mt-1 font-mono text-xl font-semibold tracking-tight">
                {formatCurrency(remainingDebt)}
              </p>
            </div>
            <div className="rounded-xl border border-white/35 bg-white/30 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <PercentIcon className="size-3.5" />
                Interest left to pay
              </p>
              <p className="mt-1 font-mono text-xl font-semibold tracking-tight">
                {formatCurrency(remainingInterest)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="mb-2 flex items-center gap-3">
            <GuideAvatar
              character={
                dsr.level === "high" || dsr.level === "stretched"
                  ? JOURNEY_CHARACTERS.kip
                  : JOURNEY_CHARACTERS.ria
              }
              mood={
                dsr.level === "high" || dsr.level === "stretched"
                  ? "caution"
                  : "calm"
              }
              size="sm"
            />
            <CardDescription>Affordability check</CardDescription>
          </div>
          <CardTitle
            className={`flex items-center gap-2 text-2xl tracking-tight ${levelTone[dsr.level]}`}
          >
            <FlagIcon className="size-5" />
            {formatDsrPercent(dsr.dsrPercent)}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            DSR status: {dsr.label}. {dsr.guidance}
          </p>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="rounded-xl border border-white/35 bg-white/30 p-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <p className="text-xs text-muted-foreground">Capability to pay</p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-tight">
              {formatCurrency(dsr.capabilityToPay)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Income remaining after this month&apos;s debt payments
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Aim to keep DSR under 60% so repayments stay manageable.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
