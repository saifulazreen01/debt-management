import {
  INCOME_CATEGORIES,
  getIncomeCategoryLabel,
} from "@/lib/income-categories";
import type { Income } from "@/lib/generated/prisma/client";
import type { IncomeCategory } from "@/lib/generated/prisma/enums";

export type IncomeCategoryRow = {
  category: IncomeCategory;
  label: string;
  count: number;
  monthlyAmount: number;
};

export function isIncomeActive(income: Income, asOf = new Date()) {
  if (income.startDate && asOf < income.startDate) return false;
  if (income.endDate && asOf > income.endDate) return false;
  return true;
}

export function getMonthlyIncome(incomes: Income[], asOf = new Date()) {
  return incomes
    .filter((income) => isIncomeActive(income, asOf))
    .reduce((sum, income) => sum + income.monthlyAmount, 0);
}

export type DsrLevel = "unknown" | "comfortable" | "manageable" | "stretched" | "high";

export type DsrSummary = {
  dsrPercent: number | null;
  capabilityToPay: number;
  level: DsrLevel;
  label: string;
  guidance: string;
};

export function getDsrSummary(
  monthlyIncome: number,
  monthlyDebtPayment: number
): DsrSummary {
  const capabilityToPay = monthlyIncome - monthlyDebtPayment;

  if (monthlyIncome <= 0) {
    return {
      dsrPercent: null,
      capabilityToPay,
      level: "unknown",
      label: "Need income",
      guidance: "Add income to calculate DSR and repayment capacity.",
    };
  }

  const dsrPercent = (monthlyDebtPayment / monthlyIncome) * 100;

  if (dsrPercent < 40) {
    return {
      dsrPercent,
      capabilityToPay,
      level: "comfortable",
      label: "Comfortable",
      guidance: "Debt load is low relative to income.",
    };
  }

  if (dsrPercent < 60) {
    return {
      dsrPercent,
      capabilityToPay,
      level: "manageable",
      label: "Manageable",
      guidance: "Within a commonly used healthy DSR range.",
    };
  }

  if (dsrPercent <= 70) {
    return {
      dsrPercent,
      capabilityToPay,
      level: "stretched",
      label: "Stretched",
      guidance: "Approaching typical bank DSR limits — keep new debt careful.",
    };
  }

  return {
    dsrPercent,
    capabilityToPay,
    level: "high",
    label: "High risk",
    guidance: "Debt repayments take a large share of income.",
  };
}

export function formatDsrPercent(value: number | null) {
  if (value === null) return "—";
  return `${value.toFixed(1)}%`;
}

export function getIncomeCategoryReport(
  incomes: Income[],
  asOf = new Date()
): IncomeCategoryRow[] {
  const byCategory = new Map<
    IncomeCategory,
    { count: number; monthlyAmount: number }
  >();

  for (const category of INCOME_CATEGORIES) {
    byCategory.set(category, { count: 0, monthlyAmount: 0 });
  }

  for (const income of incomes) {
    const row = byCategory.get(income.category);
    if (!row) continue;
    row.count += 1;
    if (isIncomeActive(income, asOf)) {
      row.monthlyAmount += income.monthlyAmount;
    }
  }

  return INCOME_CATEGORIES.map((category) => {
    const row = byCategory.get(category)!;
    return {
      category,
      label: getIncomeCategoryLabel(category),
      ...row,
    };
  });
}
