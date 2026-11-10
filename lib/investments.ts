import {
  INVESTMENT_CATEGORIES,
  getInvestmentCategoryLabel,
} from "@/lib/investment-categories";
import type { Investment } from "@/lib/generated/prisma/client";
import type {
  InvestmentCategory,
  InvestmentContributionType,
} from "@/lib/generated/prisma/enums";

export type InvestmentCategoryRow = {
  category: InvestmentCategory;
  label: string;
  count: number;
  amount: number;
  monthlyContribution: number;
};

export function getTotalInvestments(investments: Investment[]) {
  return investments.reduce((sum, item) => sum + item.amount, 0);
}

export function getMonthlyInvestmentContribution(
  investment: Investment,
  monthlyIncome = 0
) {
  if (
    investment.contributionType === "NONE" ||
    investment.contributionValue == null ||
    investment.contributionValue <= 0
  ) {
    return 0;
  }

  if (investment.contributionType === "FIXED") {
    return investment.contributionValue;
  }

  return (monthlyIncome * investment.contributionValue) / 100;
}

export function getTotalMonthlyInvestmentContribution(
  investments: Investment[],
  monthlyIncome = 0
) {
  return investments.reduce(
    (sum, item) => sum + getMonthlyInvestmentContribution(item, monthlyIncome),
    0
  );
}

export function formatContributionLabel(
  investment: Investment,
  monthlyIncome = 0
) {
  if (
    investment.contributionType === "NONE" ||
    investment.contributionValue == null
  ) {
    return "No monthly contribution";
  }

  if (investment.contributionType === "FIXED") {
    return `Fixed ${new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    }).format(investment.contributionValue)} / month`;
  }

  const amount = getMonthlyInvestmentContribution(investment, monthlyIncome);
  return `${investment.contributionValue}% of income / month ≈ ${new Intl.NumberFormat(
    "en-MY",
    {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    }
  ).format(amount)}`;
}

export function isContributionType(
  value: string
): value is InvestmentContributionType {
  return value === "NONE" || value === "FIXED" || value === "PERCENTAGE";
}

export function getInvestmentCategoryReport(
  investments: Investment[],
  monthlyIncome = 0
): InvestmentCategoryRow[] {
  const byCategory = new Map<
    InvestmentCategory,
    { count: number; amount: number; monthlyContribution: number }
  >();

  for (const category of INVESTMENT_CATEGORIES) {
    byCategory.set(category, {
      count: 0,
      amount: 0,
      monthlyContribution: 0,
    });
  }

  for (const investment of investments) {
    const row = byCategory.get(investment.category);
    if (!row) continue;
    row.count += 1;
    row.amount += investment.amount;
    row.monthlyContribution += getMonthlyInvestmentContribution(
      investment,
      monthlyIncome
    );
  }

  return INVESTMENT_CATEGORIES.map((category) => {
    const row = byCategory.get(category)!;
    return {
      category,
      label: getInvestmentCategoryLabel(category),
      ...row,
    };
  });
}
