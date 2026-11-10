import {
  DEBT_CATEGORIES,
  getDebtCategoryLabel,
} from "@/lib/debt-categories";
import type { Debt } from "@/lib/generated/prisma/client";
import type { DebtCategory } from "@/lib/generated/prisma/enums";

export type MonthlyPaymentPoint = {
  month: string;
  label: string;
  total: number;
};

export type CategoryReportRow = {
  category: DebtCategory;
  label: string;
  count: number;
  remaining: number;
  monthlyPayment: number;
  totalOwed: number;
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function monthsElapsed(start: Date, asOf: Date) {
  const startMonth = startOfMonth(start);
  const asOfMonth = startOfMonth(asOf);
  if (asOfMonth < startMonth) return 0;

  return (
    (asOfMonth.getFullYear() - startMonth.getFullYear()) * 12 +
    (asOfMonth.getMonth() - startMonth.getMonth()) +
    1
  );
}

export function getLoanTermMonths(startDate: Date, endDate: Date) {
  const start = startOfMonth(startDate);
  const end = startOfMonth(endDate);
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;
  return Math.max(1, months);
}

export function calculateMonthlyPaymentFromInterest({
  principal,
  annualRatePercent,
  startDate,
  endDate,
  months,
}: {
  principal: number;
  annualRatePercent: number;
  startDate?: Date;
  endDate?: Date;
  months?: number;
}) {
  const termMonths =
    months ??
    (startDate && endDate ? getLoanTermMonths(startDate, endDate) : 0);
  if (principal <= 0 || termMonths <= 0) return 0;
  if (annualRatePercent <= 0) {
    return principal / termMonths;
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

/** Approximate APR from a known installment (reducing-balance formula). */
export function estimateAnnualRateFromPayment({
  principal,
  monthlyPayment,
  startDate,
  endDate,
  months,
}: {
  principal: number;
  monthlyPayment: number;
  startDate?: Date;
  endDate?: Date;
  months?: number;
}) {
  const termMonths =
    months ??
    (startDate && endDate ? getLoanTermMonths(startDate, endDate) : 0);
  if (principal <= 0 || monthlyPayment <= 0 || termMonths <= 0) return null;

  const zeroInterestPayment = principal / termMonths;
  if (monthlyPayment <= zeroInterestPayment + 0.0001) return 0;

  let low = 0;
  let high = 100;
  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    const estimated = calculateMonthlyPaymentFromInterest({
      principal,
      annualRatePercent: mid,
      months: termMonths,
    });
    if (estimated > monthlyPayment) high = mid;
    else low = mid;
  }

  return Number(((low + high) / 2).toFixed(4));
}

export type DebtCostPreview = {
  months: number;
  monthlyPayment: number;
  totalPayable: number;
  totalInterest: number;
  fee: number;
  totalCost: number;
  netDisbursed: number;
  estimatedAnnualRate: number | null;
};

export function getDebtCostPreview({
  loanAmount,
  monthlyPayment,
  fee = 0,
  startDate,
  endDate,
  interestRate = null,
}: {
  loanAmount: number;
  monthlyPayment: number;
  fee?: number;
  startDate: Date;
  endDate: Date;
  interestRate?: number | null;
}): DebtCostPreview | null {
  if (loanAmount <= 0 || monthlyPayment <= 0 || endDate < startDate) {
    return null;
  }

  const months = getLoanTermMonths(startDate, endDate);
  const totalPayable = monthlyPayment * months;
  const totalInterest = Math.max(0, totalPayable - loanAmount);
  const safeFee = Math.max(0, fee);
  const estimatedAnnualRate =
    interestRate != null && interestRate >= 0
      ? interestRate
      : estimateAnnualRateFromPayment({
          principal: loanAmount,
          monthlyPayment,
          months,
        });

  return {
    months,
    monthlyPayment,
    totalPayable,
    totalInterest,
    fee: safeFee,
    totalCost: totalInterest + safeFee,
    netDisbursed: Math.max(0, loanAmount - safeFee),
    estimatedAnnualRate,
  };
}

export function paymentsMatch(
  calculated: number,
  statement: number,
  toleranceRatio = 0.01
) {
  const tolerance = Math.max(1, calculated * toleranceRatio);
  return Math.abs(calculated - statement) <= tolerance;
}

export function getInterestTypeLabel(type: Debt["interestType"]) {
  if (type === "FIXED") return "Fixed";
  if (type === "VARIABLE") return "Variable";
  return null;
}

export function formatPaymentDueDay(day: number) {
  const remainder = day % 10;
  const suffix =
    day >= 11 && day <= 13
      ? "th"
      : remainder === 1
        ? "st"
        : remainder === 2
          ? "nd"
          : remainder === 3
            ? "rd"
            : "th";
  return `${day}${suffix}`;
}

export function getTotalOwed(debt: Debt) {
  // Remaining balance tracks financed loan amount.
  // Upfront fees (stamp duty, wakalah, etc.) are separate costs.
  return debt.loanAmount;
}

export function getTotalPayable(debt: Debt) {
  return debt.monthlyPayment * getLoanTermMonths(debt.startDate, debt.endDate);
}

export function getInterestUponMaturity(debt: Debt) {
  return Math.max(0, getTotalPayable(debt) - getTotalOwed(debt));
}

export function getTotalInterestUponMaturity(debts: Debt[]) {
  return debts.reduce((sum, debt) => sum + getInterestUponMaturity(debt), 0);
}

export function getRemainingDebt(debt: Debt, asOf = new Date()) {
  const totalOwed = getTotalOwed(debt);
  if (asOf < debt.startDate) return totalOwed;
  if (asOf > debt.endDate) return 0;

  const paid = monthsElapsed(debt.startDate, asOf) * debt.monthlyPayment;
  return Math.max(0, totalOwed - paid);
}

export function isDebtActive(debt: Debt, asOf = new Date()) {
  return asOf >= debt.startDate && asOf <= debt.endDate;
}

export function getTotalDebt(debts: Debt[], asOf = new Date()) {
  return debts.reduce((sum, debt) => sum + getRemainingDebt(debt, asOf), 0);
}

export function getMonthlyRepayment(debts: Debt[], asOf = new Date()) {
  return debts
    .filter((debt) => isDebtActive(debt, asOf))
    .reduce((sum, debt) => sum + debt.monthlyPayment, 0);
}

export function getMonthsRemaining(debt: Debt, asOf = new Date()) {
  if (asOf > debt.endDate) return 0;
  const from = asOf < debt.startDate ? debt.startDate : asOf;
  return getLoanTermMonths(from, debt.endDate);
}

export function getRemainingInterest(debt: Debt, asOf = new Date()) {
  const monthsLeft = getMonthsRemaining(debt, asOf);
  const remainingBalance = getRemainingDebt(debt, asOf);
  return Math.max(0, monthsLeft * debt.monthlyPayment - remainingBalance);
}

export function getTotalRemainingInterest(debts: Debt[], asOf = new Date()) {
  return debts.reduce((sum, debt) => sum + getRemainingInterest(debt, asOf), 0);
}

export function getDebtProgress(debt: Debt, asOf = new Date()) {
  const totalOwed = getTotalOwed(debt);
  if (totalOwed <= 0) return 0;
  const remaining = getRemainingDebt(debt, asOf);
  return Math.min(100, Math.max(0, ((totalOwed - remaining) / totalOwed) * 100));
}

export function getOverallDebtProgress(debts: Debt[], asOf = new Date()) {
  const totalOwed = debts.reduce((sum, debt) => sum + getTotalOwed(debt), 0);
  if (totalOwed <= 0) return 0;
  const remaining = getTotalDebt(debts, asOf);
  return Math.min(100, Math.max(0, ((totalOwed - remaining) / totalOwed) * 100));
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getNextDueDate(debt: Debt, asOf = new Date()) {
  if (asOf > debt.endDate) return null;

  const year = asOf.getFullYear();
  const month = asOf.getMonth();
  const today = new Date(year, month, asOf.getDate());

  const buildDue = (y: number, m: number) => {
    const day = Math.min(debt.paymentDueDay, daysInMonth(y, m));
    return new Date(y, m, day);
  };

  let due = buildDue(year, month);
  if (due < today) {
    due = buildDue(year, month + 1);
  }

  if (due < debt.startDate) {
    due = buildDue(debt.startDate.getFullYear(), debt.startDate.getMonth());
    if (due < debt.startDate) {
      due = buildDue(
        debt.startDate.getFullYear(),
        debt.startDate.getMonth() + 1
      );
    }
  }

  if (due > debt.endDate) return null;
  return due;
}

export function getDebtFreedomDate(debts: Debt[], asOf = new Date()) {
  const active = debts.filter(
    (debt) => debt.endDate >= asOf && getRemainingDebt(debt, asOf) > 0
  );
  if (active.length === 0) return null;
  return active.reduce(
    (latest, debt) => (debt.endDate > latest ? debt.endDate : latest),
    active[0].endDate
  );
}

export function getMonthsToDebtFreedom(debts: Debt[], asOf = new Date()) {
  const freedomDate = getDebtFreedomDate(debts, asOf);
  if (!freedomDate) return 0;
  return getLoanTermMonths(asOf, freedomDate);
}

export type DebtInsight = {
  debt: Debt;
  remaining: number;
  progress: number;
  monthsLeft: number;
  remainingInterest: number;
  nextDueDate: Date | null;
  settleDate: Date;
  dueThisMonth: number;
};

export function getDebtInsights(debts: Debt[], asOf = new Date()): DebtInsight[] {
  return debts
    .map((debt) => {
      const active = isDebtActive(debt, asOf);
      return {
        debt,
        remaining: getRemainingDebt(debt, asOf),
        progress: getDebtProgress(debt, asOf),
        monthsLeft: getMonthsRemaining(debt, asOf),
        remainingInterest: getRemainingInterest(debt, asOf),
        nextDueDate: getNextDueDate(debt, asOf),
        settleDate: debt.endDate,
        dueThisMonth: active ? debt.monthlyPayment : 0,
      };
    })
    .sort((a, b) => {
      if (a.nextDueDate && b.nextDueDate) {
        return a.nextDueDate.getTime() - b.nextDueDate.getTime();
      }
      if (a.nextDueDate) return -1;
      if (b.nextDueDate) return 1;
      return a.settleDate.getTime() - b.settleDate.getTime();
    });
}

export function getMonthlyPaymentSeries(
  debts: Debt[],
  asOf = new Date(),
  months = 12
): MonthlyPaymentPoint[] {
  const points: MonthlyPaymentPoint[] = [];
  const cursor = startOfMonth(asOf);
  const formatter = new Intl.DateTimeFormat("en-MY", {
    month: "short",
    year: "numeric",
  });

  for (let index = 0; index < months; index += 1) {
    const monthStart = startOfMonth(cursor);
    const monthEnd = endOfMonth(cursor);
    const total = debts.reduce((sum, debt) => {
      const overlaps = debt.startDate <= monthEnd && debt.endDate >= monthStart;
      return overlaps ? sum + debt.monthlyPayment : sum;
    }, 0);

    points.push({
      month: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`,
      label: formatter.format(cursor),
      total,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return points;
}

export function getCategoryReport(
  debts: Debt[],
  asOf = new Date()
): CategoryReportRow[] {
  const byCategory = new Map<
    DebtCategory,
    { count: number; remaining: number; monthlyPayment: number; totalOwed: number }
  >();

  for (const category of DEBT_CATEGORIES) {
    byCategory.set(category, {
      count: 0,
      remaining: 0,
      monthlyPayment: 0,
      totalOwed: 0,
    });
  }

  for (const debt of debts) {
    const row = byCategory.get(debt.category);
    if (!row) continue;

    row.count += 1;
    row.remaining += getRemainingDebt(debt, asOf);
    row.totalOwed += getTotalOwed(debt);
    if (isDebtActive(debt, asOf)) {
      row.monthlyPayment += debt.monthlyPayment;
    }
  }

  return DEBT_CATEGORIES.map((category) => {
    const row = byCategory.get(category)!;
    return {
      category,
      label: getDebtCategoryLabel(category),
      ...row,
    };
  });
}
