import type { InvestmentCategory } from "@/lib/generated/prisma/enums";

export const INVESTMENT_CATEGORIES = [
  "MEDICAL_CARD",
  "FIXED_DEPOSIT",
  "ASB",
  "TABUNG_HAJI",
  "OTHER",
] as const satisfies readonly InvestmentCategory[];

export const INVESTMENT_CATEGORY_LABELS: Record<InvestmentCategory, string> = {
  MEDICAL_CARD: "Medical Card",
  FIXED_DEPOSIT: "Fixed Deposit",
  ASB: "ASB",
  TABUNG_HAJI: "Tabung Haji",
  OTHER: "Other",
};

export function isInvestmentCategory(
  value: string
): value is InvestmentCategory {
  return (INVESTMENT_CATEGORIES as readonly string[]).includes(value);
}

export function getInvestmentCategoryLabel(category: InvestmentCategory) {
  return INVESTMENT_CATEGORY_LABELS[category];
}
