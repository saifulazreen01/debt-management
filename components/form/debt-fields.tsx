"use client";

import { useMemo, useState } from "react";
import { DebtPreview } from "@/components/form/debt-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEBT_CATEGORIES,
  DEBT_CATEGORY_LABELS,
} from "@/lib/debt-categories";
import { toDateInputValue, type DebtEntryMode } from "@/lib/debt-form";
import {
  calculateMonthlyPaymentFromInterest,
  formatCurrency,
  getDebtCostPreview,
  getLoanTermMonths,
  paymentsMatch,
} from "@/lib/debts";
import type { Debt } from "@/lib/generated/prisma/client";
import { cn } from "cn";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-white/40 px-2.5 py-1 text-base outline-none transition-colors backdrop-blur-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30";

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function initialMode(debt?: Debt): DebtEntryMode {
  if (debt?.interestRate != null && debt.interestRate > 0) return "advanced";
  return "simple";
}

export function DebtFields({
  debt,
  idPrefix = "",
}: {
  debt?: Debt;
  idPrefix?: string;
}) {
  const fieldId = (name: string) => `${idPrefix}${name}`;
  const [mode, setMode] = useState<DebtEntryMode>(() => initialMode(debt));
  const [loanAmount, setLoanAmount] = useState(
    debt?.loanAmount != null ? String(debt.loanAmount) : ""
  );
  const [fee, setFee] = useState(
    debt?.fee != null && debt.fee > 0 ? String(debt.fee) : ""
  );
  const [monthlyPayment, setMonthlyPayment] = useState(
    debt?.monthlyPayment != null ? String(debt.monthlyPayment) : ""
  );
  const [interestRate, setInterestRate] = useState(
    debt?.interestRate != null ? String(debt.interestRate) : ""
  );
  const [interestType, setInterestType] = useState(
    debt?.interestType ?? "FIXED"
  );
  const [statementMonthly, setStatementMonthly] = useState("");
  const [useStatementMonthly, setUseStatementMonthly] = useState(false);
  const [startDate, setStartDate] = useState(
    debt ? toDateInputValue(debt.startDate) : ""
  );
  const [endDate, setEndDate] = useState(
    debt ? toDateInputValue(debt.endDate) : ""
  );

  const loan = Number(loanAmount) || 0;
  const feeValue = Number(fee) || 0;
  const payment = Number(monthlyPayment) || 0;
  const rate = Number(interestRate) || 0;
  const statement = Number(statementMonthly) || 0;

  const calculatedMonthly = useMemo(() => {
    if (mode !== "advanced" || loan <= 0 || rate < 0 || !startDate || !endDate) {
      return 0;
    }
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);
    if (!start || !end || end < start) return 0;
    return calculateMonthlyPaymentFromInterest({
      principal: loan,
      annualRatePercent: rate,
      startDate: start,
      endDate: end,
    });
  }, [mode, loan, rate, startDate, endDate]);

  const effectiveMonthly =
    mode === "advanced"
      ? useStatementMonthly && statement > 0
        ? statement
        : calculatedMonthly
      : payment;

  const preview = useMemo(() => {
    if (!startDate || !endDate || loan <= 0 || effectiveMonthly <= 0) return null;
    const start = parseLocalDate(startDate);
    const end = parseLocalDate(endDate);
    if (!start || !end || end < start) return null;
    return getDebtCostPreview({
      loanAmount: loan,
      monthlyPayment: effectiveMonthly,
      fee: feeValue,
      startDate: start,
      endDate: end,
      interestRate: mode === "advanced" ? rate : null,
    });
  }, [startDate, endDate, loan, effectiveMonthly, feeValue, mode, rate]);

  const matchLabel = useMemo(() => {
    if (mode !== "advanced" || statement <= 0 || calculatedMonthly <= 0) {
      return null;
    }
    if (paymentsMatch(calculatedMonthly, statement)) {
      return `Statement matches calculated installment (${formatCurrency(calculatedMonthly)}).`;
    }
    if (useStatementMonthly) {
      return `Using your statement amount. Calculated was ${formatCurrency(calculatedMonthly)}.`;
    }
    return `Statement differs from calculated ${formatCurrency(calculatedMonthly)}. Adjust inputs or confirm statement amount.`;
  }, [mode, statement, calculatedMonthly, useStatementMonthly]);

  return (
    <>
      <input type="hidden" name="entryMode" value={mode} />
      <input
        type="hidden"
        name="useStatementMonthly"
        value={useStatementMonthly ? "1" : "0"}
      />
      {mode === "advanced" ? (
        <input
          type="hidden"
          name="monthlyPayment"
          value={
            effectiveMonthly > 0 ? effectiveMonthly.toFixed(2) : ""
          }
        />
      ) : null}

      <div className="sm:col-span-2">
        <div className="inline-flex rounded-xl border border-white/40 bg-white/25 p-1 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <Button
            type="button"
            size="sm"
            variant={mode === "simple" ? "default" : "ghost"}
            className={cn(mode === "simple" ? "" : "text-muted-foreground")}
            onClick={() => {
              setMode("simple");
              setUseStatementMonthly(false);
            }}
          >
            Simple
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "advanced" ? "default" : "ghost"}
            className={cn(mode === "advanced" ? "" : "text-muted-foreground")}
            onClick={() => setMode("advanced")}
          >
            Advanced
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {mode === "simple"
            ? "Enter loan amount and your monthly payment. We estimate interest for you."
            : "Enter loan amount, rate, and upfront fees. We calculate the monthly installment."}
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={fieldId("name")}>Debt name</Label>
        <Input
          id={fieldId("name")}
          name="name"
          placeholder="Maybank card, Proton loan…"
          defaultValue={debt?.name}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={fieldId("category")}>Category</Label>
        <select
          id={fieldId("category")}
          name="category"
          required
          defaultValue={debt?.category ?? ""}
          className={selectClassName}
        >
          <option value="" disabled>
            Select category
          </option>
          {DEBT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {DEBT_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={fieldId("loanAmount")}>Loan amount</Label>
        <Input
          id={fieldId("loanAmount")}
          name="loanAmount"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={loanAmount}
          onChange={(event) => setLoanAmount(event.currentTarget.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={fieldId("paymentDueDay")}>Payment due day</Label>
        <Input
          id={fieldId("paymentDueDay")}
          name="paymentDueDay"
          type="number"
          min="1"
          max="31"
          step="1"
          placeholder="e.g. 15"
          defaultValue={debt?.paymentDueDay}
          required
        />
      </div>

      {mode === "simple" ? (
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor={fieldId("monthlyPayment")}>Monthly payment</Label>
          <Input
            id={fieldId("monthlyPayment")}
            name="monthlyPayment"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={monthlyPayment}
            onChange={(event) => setMonthlyPayment(event.currentTarget.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Use the installment from your bank statement or loan offer.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-2">
            <Label htmlFor={fieldId("interestRate")}>Interest rate % p.a.</Label>
            <Input
              id={fieldId("interestRate")}
              name="interestRate"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 3.5"
              value={interestRate}
              onChange={(event) => setInterestRate(event.currentTarget.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor={fieldId("interestType")}>Interest type</Label>
            <select
              id={fieldId("interestType")}
              name="interestType"
              required
              value={interestType ?? "FIXED"}
              onChange={(event) =>
                setInterestType(
                  event.currentTarget.value as "FIXED" | "VARIABLE"
                )
              }
              className={selectClassName}
            >
              <option value="FIXED">Fixed</option>
              <option value="VARIABLE">Variable</option>
            </select>
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor={fieldId("fee")}>
              Upfront fees (stamp duty, wakalah, etc.)
            </Label>
            <Input
              id={fieldId("fee")}
              name="fee"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={fee}
              onChange={(event) => setFee(event.currentTarget.value)}
            />
            <p className="text-xs text-muted-foreground">
              Deducted in the first phase from disbursement. Not added into the
              monthly amortization principal.
            </p>
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor={fieldId("statementMonthly")}>
              Statement installment (optional check)
            </Label>
            <Input
              id={fieldId("statementMonthly")}
              name="statementMonthly"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Compare with bank statement"
              value={statementMonthly}
              onChange={(event) => {
                setStatementMonthly(event.currentTarget.value);
                setUseStatementMonthly(false);
              }}
            />
            {statement > 0 &&
            calculatedMonthly > 0 &&
            !paymentsMatch(calculatedMonthly, statement) ? (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Difference{" "}
                  {formatCurrency(Math.abs(calculatedMonthly - statement))}.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setUseStatementMonthly(true)}
                >
                  Use statement amount
                </Button>
              </div>
            ) : null}
          </div>
        </>
      )}

      {mode === "simple" ? (
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor={fieldId("fee")}>
            Upfront fees (optional)
          </Label>
          <Input
            id={fieldId("fee")}
            name="fee"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={fee}
            onChange={(event) => setFee(event.currentTarget.value)}
          />
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor={fieldId("startDate")}>Start from</Label>
        <Input
          id={fieldId("startDate")}
          name="startDate"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.currentTarget.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={fieldId("endDate")}>End date</Label>
        <Input
          id={fieldId("endDate")}
          name="endDate"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.currentTarget.value)}
          required
        />
        {startDate && endDate && parseLocalDate(startDate) && parseLocalDate(endDate) ? (
          <p className="text-xs text-muted-foreground">
            Tenure{" "}
            {getLoanTermMonths(
              parseLocalDate(startDate)!,
              parseLocalDate(endDate)!
            )}{" "}
            months
          </p>
        ) : null}
      </div>

      <div className="sm:col-span-2">
        <DebtPreview preview={preview} matchLabel={matchLabel} />
      </div>
    </>
  );
}
