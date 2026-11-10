"use client";

import { useMemo, useState } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { AmortizationTable } from "@/components/amortization-table";
import { InvestmentProjectionTable } from "@/components/investment-projection-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  bestInvestmentId,
  bestLoanId,
  compareInvestments,
  compareLoans,
  type CalculatorMode,
  type InvestmentGrowthType,
  type InvestmentScenarioInput,
  type LoanRateType,
  type LoanScenarioInput,
} from "@/lib/calculator";
import { formatCurrency } from "@/lib/debts";
import {
  INVESTMENT_GROWTH_TYPES,
  INVESTMENT_GROWTH_TYPE_HINTS,
  INVESTMENT_GROWTH_TYPE_LABELS,
} from "@/lib/investment-projection";
import { cn } from "cn";

const MAX_SCENARIOS = 3;

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-white/40 px-2.5 py-1 text-base outline-none transition-colors backdrop-blur-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30";

type InvestmentDraft = {
  id: string;
  name: string;
  initialAmount: string;
  monthlyContribution: string;
  annualReturnPercent: string;
  years: string;
  growthType: InvestmentGrowthType;
  capitalGrowthPercent: string;
};

type LoanDraft = {
  id: string;
  name: string;
  principal: string;
  annualRatePercent: string;
  years: string;
  rateType: LoanRateType;
  revisedRatePercent: string;
  fixedPeriodYears: string;
};

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function createInvestmentDraft(
  index: number,
  defaults?: Partial<Omit<InvestmentDraft, "id">>
): InvestmentDraft {
  return {
    id: createId(),
    name: defaults?.name ?? `Option ${index + 1}`,
    initialAmount: defaults?.initialAmount ?? "10000",
    monthlyContribution:
      defaults?.monthlyContribution ?? (index === 0 ? "500" : "500"),
    annualReturnPercent:
      defaults?.annualReturnPercent ?? (index === 0 ? "8" : "5"),
    years: defaults?.years ?? "10",
    growthType: defaults?.growthType ?? (index === 0 ? "COMPOUNDING" : "DIVIDEND"),
    capitalGrowthPercent: defaults?.capitalGrowthPercent ?? "0",
  };
}

function createLoanDraft(
  index: number,
  defaults?: Partial<Omit<LoanDraft, "id">>
): LoanDraft {
  return {
    id: createId(),
    name: defaults?.name ?? `Loan ${index + 1}`,
    principal: defaults?.principal ?? "50000",
    annualRatePercent:
      defaults?.annualRatePercent ?? (index === 0 ? "4.5" : "3.9"),
    years: defaults?.years ?? (index === 0 ? "7" : "10"),
    rateType: defaults?.rateType ?? (index === 0 ? "FIXED" : "VARIABLE"),
    revisedRatePercent:
      defaults?.revisedRatePercent ?? (index === 0 ? "4.5" : "5.5"),
    fixedPeriodYears: defaults?.fixedPeriodYears ?? "3",
  };
}

export function FinancialCalculator() {
  const [mode, setMode] = useState<CalculatorMode>("investments");
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<
    string | null
  >(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [investments, setInvestments] = useState<InvestmentDraft[]>(() => [
    createInvestmentDraft(0, {
      name: "Growth fund",
      growthType: "COMPOUNDING",
      annualReturnPercent: "8",
      monthlyContribution: "500",
    }),
    createInvestmentDraft(1, {
      name: "Dividend stock",
      growthType: "DIVIDEND",
      annualReturnPercent: "5",
      capitalGrowthPercent: "2",
      monthlyContribution: "500",
    }),
  ]);
  const [loans, setLoans] = useState<LoanDraft[]>(() => [
    createLoanDraft(0, {
      name: "Bank A fixed",
      rateType: "FIXED",
      annualRatePercent: "4.5",
      years: "7",
    }),
    createLoanDraft(1, {
      name: "Bank B variable",
      rateType: "VARIABLE",
      annualRatePercent: "3.9",
      revisedRatePercent: "5.5",
      fixedPeriodYears: "3",
      years: "10",
    }),
  ]);

  const investmentResults = useMemo(() => {
    const scenarios: InvestmentScenarioInput[] = investments.map((item) => ({
      id: item.id,
      name: item.name.trim() || "Untitled",
      initialAmount: toNumber(item.initialAmount),
      monthlyContribution: toNumber(item.monthlyContribution),
      annualReturnPercent: toNumber(item.annualReturnPercent),
      years: toNumber(item.years),
      growthType: item.growthType,
      capitalGrowthPercent: toNumber(item.capitalGrowthPercent),
    }));
    return compareInvestments(scenarios);
  }, [investments]);

  const loanResults = useMemo(() => {
    const scenarios: LoanScenarioInput[] = loans.map((item) => ({
      id: item.id,
      name: item.name.trim() || "Untitled",
      principal: toNumber(item.principal),
      annualRatePercent: toNumber(item.annualRatePercent),
      years: toNumber(item.years),
      rateType: item.rateType,
      revisedRatePercent: toNumber(item.revisedRatePercent),
      fixedPeriodYears: toNumber(item.fixedPeriodYears),
    }));
    return compareLoans(scenarios);
  }, [loans]);

  const winningInvestmentId = bestInvestmentId(investmentResults);
  const winningLoanId = bestLoanId(loanResults);
  const activeInvestmentId =
    selectedInvestmentId &&
    investmentResults.some((item) => item.id === selectedInvestmentId)
      ? selectedInvestmentId
      : (winningInvestmentId ?? investmentResults[0]?.id ?? null);
  const activeInvestment = investmentResults.find(
    (item) => item.id === activeInvestmentId
  );
  const activeLoanId =
    selectedLoanId && loanResults.some((item) => item.id === selectedLoanId)
      ? selectedLoanId
      : (winningLoanId ?? loanResults[0]?.id ?? null);
  const activeLoan = loanResults.find((item) => item.id === activeLoanId);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardDescription>What do you want to compare?</CardDescription>
          <CardTitle className="font-heading text-xl font-semibold tracking-tight">
            Pick a calculator mode
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <ModeButton
            active={mode === "investments"}
            title="Compare investments"
            description="Compounding vs dividend styles — see yearly wealth before you choose."
            onClick={() => setMode("investments")}
          />
          <ModeButton
            active={mode === "loans"}
            title="Compare loans"
            description="Fixed vs variable rates — see yearly amortization before you choose."
            onClick={() => setMode("loans")}
          />
        </CardContent>
      </Card>

      {mode === "investments" ? (
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Compare compounding and dividend styles. Winner is highest total
              wealth — open a schedule to see yearly growth.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={investments.length >= MAX_SCENARIOS}
              onClick={() =>
                setInvestments((current) => [
                  ...current,
                  createInvestmentDraft(current.length),
                ])
              }
            >
              <PlusIcon data-icon="inline-start" />
              Add option
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {investments.map((item, index) => {
              const result = investmentResults[index];
              const isBest = result?.id === winningInvestmentId;
              const isActive = result?.id === activeInvestmentId;
              const usesDividend =
                item.growthType === "DIVIDEND" ||
                item.growthType === "DIVIDEND_REINVEST";

              return (
                <Card
                  key={item.id}
                  className={cn(
                    isBest &&
                      "ring-2 ring-primary/50 shadow-[0_0_0_1px_rgba(255,255,255,0.35)]",
                    isActive && !isBest && "ring-1 ring-border"
                  )}
                >
                  <CardHeader className="flex-row items-start justify-between gap-2">
                    <div className="grid gap-1">
                      <CardDescription>
                        {isBest ? "Best total wealth" : `Option ${index + 1}`}
                      </CardDescription>
                      <Input
                        value={item.name}
                        onChange={(event) =>
                          setInvestments((current) =>
                            current.map((row) =>
                              row.id === item.id
                                ? { ...row, name: event.target.value }
                                : row
                            )
                          )
                        }
                        className="h-9 font-heading text-base font-semibold"
                        aria-label="Investment name"
                      />
                    </div>
                    {investments.length > 2 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => {
                          setInvestments((current) =>
                            current.filter((row) => row.id !== item.id)
                          );
                          if (selectedInvestmentId === item.id) {
                            setSelectedInvestmentId(null);
                          }
                        }}
                      >
                        <Trash2Icon />
                      </Button>
                    ) : null}
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor={`investment-growth-type-${item.id}`}>
                        Growth type
                      </Label>
                      <select
                        id={`investment-growth-type-${item.id}`}
                        value={item.growthType}
                        onChange={(event) =>
                          setInvestments((current) =>
                            current.map((row) =>
                              row.id === item.id
                                ? {
                                    ...row,
                                    growthType: event.target
                                      .value as InvestmentGrowthType,
                                  }
                                : row
                            )
                          )
                        }
                        className={selectClassName}
                      >
                        {INVESTMENT_GROWTH_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {INVESTMENT_GROWTH_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground">
                        {INVESTMENT_GROWTH_TYPE_HINTS[item.growthType]}
                      </p>
                    </div>

                    <Field
                      label="Starting amount (RM)"
                      value={item.initialAmount}
                      onChange={(value) =>
                        setInvestments((current) =>
                          current.map((row) =>
                            row.id === item.id
                              ? { ...row, initialAmount: value }
                              : row
                          )
                        )
                      }
                    />
                    <Field
                      label="Monthly contribution (RM)"
                      value={item.monthlyContribution}
                      onChange={(value) =>
                        setInvestments((current) =>
                          current.map((row) =>
                            row.id === item.id
                              ? { ...row, monthlyContribution: value }
                              : row
                          )
                        )
                      }
                    />
                    <Field
                      label={
                        usesDividend
                          ? "Dividend yield (%)"
                          : "Expected annual return (%)"
                      }
                      value={item.annualReturnPercent}
                      onChange={(value) =>
                        setInvestments((current) =>
                          current.map((row) =>
                            row.id === item.id
                              ? { ...row, annualReturnPercent: value }
                              : row
                          )
                        )
                      }
                      step="0.1"
                    />
                    {usesDividend ? (
                      <Field
                        label="Capital growth (%)"
                        value={item.capitalGrowthPercent}
                        onChange={(value) =>
                          setInvestments((current) =>
                            current.map((row) =>
                              row.id === item.id
                                ? { ...row, capitalGrowthPercent: value }
                                : row
                            )
                          )
                        }
                        step="0.1"
                      />
                    ) : null}
                    <Field
                      label="Years"
                      value={item.years}
                      onChange={(value) =>
                        setInvestments((current) =>
                          current.map((row) =>
                            row.id === item.id ? { ...row, years: value } : row
                          )
                        )
                      }
                    />

                    {result ? (
                      <div className="grid gap-2 rounded-xl border border-white/35 bg-white/25 p-3 dark:border-white/10 dark:bg-white/5">
                        <Stat label="Growth type" value={result.growthTypeLabel} />
                        <Stat
                          label="Total wealth"
                          value={formatCurrency(result.totalWealth)}
                          emphasize
                        />
                        <Stat
                          label="Invested balance"
                          value={formatCurrency(result.futureValue)}
                        />
                        {result.totalDividends > 0 ? (
                          <Stat
                            label="Cash dividends"
                            value={formatCurrency(result.totalDividends)}
                          />
                        ) : null}
                        <Stat
                          label="Total put in"
                          value={formatCurrency(result.totalContributed)}
                        />
                        <Stat
                          label="Estimated gain"
                          value={formatCurrency(result.gain)}
                        />
                        <Button
                          type="button"
                          variant={isActive ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => setSelectedInvestmentId(item.id)}
                        >
                          {isActive
                            ? "Showing yearly table"
                            : "View yearly projection"}
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {activeInvestment ? (
            <InvestmentProjectionTable
              years={activeInvestment.schedule.years}
              title={`${activeInvestment.name} · yearly projection`}
              description={
                activeInvestment.growthType === "DIVIDEND"
                  ? `Dividend payout at ${activeInvestment.annualReturnPercent}% yield` +
                    (activeInvestment.capitalGrowthPercent > 0
                      ? ` with ${activeInvestment.capitalGrowthPercent}% capital growth. Cash dividends stay outside the balance.`
                      : ". Cash dividends stay outside the balance.")
                  : activeInvestment.growthType === "DIVIDEND_REINVEST"
                    ? `Dividend reinvest at ${activeInvestment.annualReturnPercent}% yield` +
                      (activeInvestment.capitalGrowthPercent > 0
                        ? ` with ${activeInvestment.capitalGrowthPercent}% capital growth.`
                        : ".")
                    : `${activeInvestment.growthTypeLabel} at ${activeInvestment.annualReturnPercent}%. See wealth each year.`
              }
              showDividend={
                activeInvestment.growthType === "DIVIDEND" ||
                activeInvestment.growthType === "DIVIDEND_REINVEST"
              }
            />
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Compare fixed and variable loans. Winner is lowest total cost —
              open a schedule to see yearly payments.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loans.length >= MAX_SCENARIOS}
              onClick={() =>
                setLoans((current) => [
                  ...current,
                  createLoanDraft(current.length),
                ])
              }
            >
              <PlusIcon data-icon="inline-start" />
              Add loan
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {loans.map((item, index) => {
              const result = loanResults[index];
              const isBest = result?.id === winningLoanId;
              const isActive = result?.id === activeLoanId;

              return (
                <Card
                  key={item.id}
                  className={cn(
                    isBest &&
                      "ring-2 ring-primary/50 shadow-[0_0_0_1px_rgba(255,255,255,0.35)]",
                    isActive && !isBest && "ring-1 ring-border"
                  )}
                >
                  <CardHeader className="flex-row items-start justify-between gap-2">
                    <div className="grid gap-1">
                      <CardDescription>
                        {isBest ? "Lowest total cost" : `Loan ${index + 1}`}
                      </CardDescription>
                      <Input
                        value={item.name}
                        onChange={(event) =>
                          setLoans((current) =>
                            current.map((row) =>
                              row.id === item.id
                                ? { ...row, name: event.target.value }
                                : row
                            )
                          )
                        }
                        className="h-9 font-heading text-base font-semibold"
                        aria-label="Loan name"
                      />
                    </div>
                    {loans.length > 2 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => {
                          setLoans((current) =>
                            current.filter((row) => row.id !== item.id)
                          );
                          if (selectedLoanId === item.id) {
                            setSelectedLoanId(null);
                          }
                        }}
                      >
                        <Trash2Icon />
                      </Button>
                    ) : null}
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor={`loan-rate-type-${item.id}`}>
                        Rate type
                      </Label>
                      <select
                        id={`loan-rate-type-${item.id}`}
                        value={item.rateType}
                        onChange={(event) =>
                          setLoans((current) =>
                            current.map((row) =>
                              row.id === item.id
                                ? {
                                    ...row,
                                    rateType: event.target
                                      .value as LoanRateType,
                                  }
                                : row
                            )
                          )
                        }
                        className={selectClassName}
                      >
                        <option value="FIXED">Fixed rate</option>
                        <option value="VARIABLE">Variable rate</option>
                      </select>
                    </div>

                    <Field
                      label="Loan amount (RM)"
                      value={item.principal}
                      onChange={(value) =>
                        setLoans((current) =>
                          current.map((row) =>
                            row.id === item.id
                              ? { ...row, principal: value }
                              : row
                          )
                        )
                      }
                    />
                    <Field
                      label={
                        item.rateType === "VARIABLE"
                          ? "Starting annual rate (%)"
                          : "Annual interest rate (%)"
                      }
                      value={item.annualRatePercent}
                      onChange={(value) =>
                        setLoans((current) =>
                          current.map((row) =>
                            row.id === item.id
                              ? { ...row, annualRatePercent: value }
                              : row
                          )
                        )
                      }
                      step="0.1"
                    />

                    {item.rateType === "VARIABLE" ? (
                      <>
                        <Field
                          label="Rate after review (%)"
                          value={item.revisedRatePercent}
                          onChange={(value) =>
                            setLoans((current) =>
                              current.map((row) =>
                                row.id === item.id
                                  ? { ...row, revisedRatePercent: value }
                                  : row
                              )
                            )
                          }
                          step="0.1"
                        />
                        <Field
                          label="Years at starting rate"
                          value={item.fixedPeriodYears}
                          onChange={(value) =>
                            setLoans((current) =>
                              current.map((row) =>
                                row.id === item.id
                                  ? { ...row, fixedPeriodYears: value }
                                  : row
                              )
                            )
                          }
                        />
                      </>
                    ) : null}

                    <Field
                      label="Tenure (years)"
                      value={item.years}
                      onChange={(value) =>
                        setLoans((current) =>
                          current.map((row) =>
                            row.id === item.id ? { ...row, years: value } : row
                          )
                        )
                      }
                    />

                    {result ? (
                      <div className="grid gap-2 rounded-xl border border-white/35 bg-white/25 p-3 dark:border-white/10 dark:bg-white/5">
                        <Stat
                          label="Rate type"
                          value={result.rateTypeLabel}
                        />
                        <Stat
                          label={
                            result.rateType === "VARIABLE" &&
                            result.monthlyPayment !== result.monthlyPaymentEnd
                              ? "Starting monthly"
                              : "Monthly payment"
                          }
                          value={formatCurrency(result.monthlyPayment)}
                          emphasize
                        />
                        {result.rateType === "VARIABLE" &&
                        result.monthlyPayment !== result.monthlyPaymentEnd ? (
                          <Stat
                            label="Monthly after review"
                            value={formatCurrency(result.monthlyPaymentEnd)}
                          />
                        ) : null}
                        <Stat
                          label="Total paid"
                          value={formatCurrency(result.totalPaid)}
                        />
                        <Stat
                          label="Total interest"
                          value={formatCurrency(result.totalInterest)}
                        />
                        <Button
                          type="button"
                          variant={isActive ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => setSelectedLoanId(item.id)}
                        >
                          {isActive
                            ? "Showing yearly table"
                            : "View yearly amortization"}
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {activeLoan ? (
            <AmortizationTable
              years={activeLoan.schedule.years}
              title={`${activeLoan.name} · yearly amortization`}
              description={
                activeLoan.rateType === "VARIABLE"
                  ? `Variable loan: ${activeLoan.annualRatePercent}% for ${activeLoan.fixedPeriodYears} year${
                      activeLoan.fixedPeriodYears === 1 ? "" : "s"
                    }, then ${activeLoan.revisedRatePercent}%. See how much you pay each year.`
                  : `Fixed loan at ${activeLoan.annualRatePercent}% for the full tenure. See how much you pay each year.`
              }
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        "h-auto flex-col items-start gap-1 rounded-xl px-4 py-3 text-left whitespace-normal",
        active
          ? "border-primary/40 bg-primary/10 hover:bg-primary/15"
          : "bg-white/20 hover:bg-white/30 dark:bg-white/5 dark:hover:bg-white/10"
      )}
    >
      <span className="font-heading text-sm font-semibold tracking-tight">
        {title}
      </span>
      <span className="text-xs font-normal text-muted-foreground">
        {description}
      </span>
    </Button>
  );
}

function Field({
  label,
  value,
  onChange,
  step = "1",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  step?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "font-mono tabular-nums",
          emphasize ? "text-base font-semibold" : "text-sm"
        )}
      >
        {value}
      </span>
    </div>
  );
}
