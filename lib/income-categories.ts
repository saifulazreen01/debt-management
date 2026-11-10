import type { IncomeCategory } from "@/lib/generated/prisma/enums";

export const INCOME_CATEGORIES = [
  "SALARY",
  "OTHER",
  "LEASING",
] as const satisfies readonly IncomeCategory[];

export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, string> = {
  SALARY: "Salary",
  OTHER: "Other income",
  LEASING: "Leasing",
};

export function isIncomeCategory(value: string): value is IncomeCategory {
  return (INCOME_CATEGORIES as readonly string[]).includes(value);
}

export function getIncomeCategoryLabel(category: IncomeCategory) {
  return INCOME_CATEGORY_LABELS[category];
}
