import type { DebtCategory } from "@/lib/generated/prisma/enums";

export const DEBT_CATEGORIES = [
  "CREDIT_CARD",
  "PERSONAL_LOAN",
  "BNPL",
  "CAR_LOAN",
  "HOUSE_LOAN",
  "OTHER",
] as const satisfies readonly DebtCategory[];

export const DEBT_CATEGORY_LABELS: Record<DebtCategory, string> = {
  CREDIT_CARD: "Credit Card",
  PERSONAL_LOAN: "Personal Loan",
  BNPL: "BNPL",
  CAR_LOAN: "Car Loan",
  HOUSE_LOAN: "House Loan",
  OTHER: "Other",
};

export function isDebtCategory(value: string): value is DebtCategory {
  return (DEBT_CATEGORIES as readonly string[]).includes(value);
}

export function getDebtCategoryLabel(category: DebtCategory) {
  return DEBT_CATEGORY_LABELS[category];
}
