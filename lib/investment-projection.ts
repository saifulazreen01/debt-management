export type InvestmentGrowthType =
  | "COMPOUNDING"
  | "ANNUAL_COMPOUND"
  | "DIVIDEND"
  | "DIVIDEND_REINVEST";

export type InvestmentYear = {
  year: number;
  contributed: number;
  growth: number;
  dividend: number;
  endingBalance: number;
  totalWealth: number;
};

export type InvestmentProjection = {
  years: InvestmentYear[];
  months: number;
  totalContributed: number;
  futureValue: number;
  totalDividends: number;
  totalWealth: number;
  gain: number;
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export const INVESTMENT_GROWTH_TYPES = [
  "COMPOUNDING",
  "ANNUAL_COMPOUND",
  "DIVIDEND",
  "DIVIDEND_REINVEST",
] as const satisfies readonly InvestmentGrowthType[];

export const INVESTMENT_GROWTH_TYPE_LABELS: Record<
  InvestmentGrowthType,
  string
> = {
  COMPOUNDING: "Monthly compounding",
  ANNUAL_COMPOUND: "Annual compounding",
  DIVIDEND: "Dividend payout",
  DIVIDEND_REINVEST: "Dividend reinvest",
};

export const INVESTMENT_GROWTH_TYPE_HINTS: Record<
  InvestmentGrowthType,
  string
> = {
  COMPOUNDING: "Returns compound every month inside the investment.",
  ANNUAL_COMPOUND: "Returns compound once a year — closer to many fixed deposits.",
  DIVIDEND:
    "Dividends are paid out as cash. Optional capital growth stays in the balance.",
  DIVIDEND_REINVEST:
    "Dividends are added back into the balance each year (DRIP style).",
};

export function getInvestmentGrowthTypeLabel(type: InvestmentGrowthType) {
  return INVESTMENT_GROWTH_TYPE_LABELS[type];
}

export function isInvestmentGrowthType(
  value: string
): value is InvestmentGrowthType {
  return (INVESTMENT_GROWTH_TYPES as readonly string[]).includes(value);
}

/**
 * Builds a yearly investment projection.
 * - COMPOUNDING: monthly compound + monthly contributions
 * - ANNUAL_COMPOUND: yearly compound after 12 monthly contributions
 * - DIVIDEND: annual dividend paid out as cash; capitalGrowthPercent grows balance
 * - DIVIDEND_REINVEST: annual dividend added back into balance
 */
export function buildInvestmentProjection({
  initialAmount,
  monthlyContribution,
  annualReturnPercent,
  years,
  growthType = "COMPOUNDING",
  capitalGrowthPercent = 0,
}: {
  initialAmount: number;
  monthlyContribution: number;
  annualReturnPercent: number;
  years: number;
  growthType?: InvestmentGrowthType;
  /** Used by DIVIDEND / DIVIDEND_REINVEST for price/capital growth separate from yield. */
  capitalGrowthPercent?: number;
}): InvestmentProjection {
  const termYears = Math.max(0, Math.round(years));
  const months = termYears * 12;
  const starting = Math.max(0, initialAmount);
  const contribution = Math.max(0, monthlyContribution);
  const yieldRate = Math.max(0, annualReturnPercent) / 100;
  const capitalRate = Math.max(0, capitalGrowthPercent) / 100;
  const yearRows: InvestmentYear[] = [];

  let balance = starting;
  let cashDividends = 0;
  let totalContributed = starting;

  if (growthType === "COMPOUNDING") {
    const monthlyRate = yieldRate / 12;
    for (let year = 1; year <= termYears; year += 1) {
      const startBalance = balance;
      let contributed = 0;
      for (let month = 0; month < 12; month += 1) {
        balance = balance * (1 + monthlyRate) + contribution;
        contributed += contribution;
      }
      contributed = roundMoney(contributed);
      totalContributed = roundMoney(totalContributed + contributed);
      balance = roundMoney(balance);
      const growth = roundMoney(balance - startBalance - contributed);
      yearRows.push({
        year,
        contributed,
        growth,
        dividend: 0,
        endingBalance: balance,
        totalWealth: balance,
      });
    }
  } else if (growthType === "ANNUAL_COMPOUND") {
    for (let year = 1; year <= termYears; year += 1) {
      const contributed = roundMoney(contribution * 12);
      balance = roundMoney(balance + contributed);
      const growth = roundMoney(balance * yieldRate);
      balance = roundMoney(balance + growth);
      totalContributed = roundMoney(totalContributed + contributed);
      yearRows.push({
        year,
        contributed,
        growth,
        dividend: 0,
        endingBalance: balance,
        totalWealth: balance,
      });
    }
  } else if (growthType === "DIVIDEND") {
    for (let year = 1; year <= termYears; year += 1) {
      const contributed = roundMoney(contribution * 12);
      balance = roundMoney(balance + contributed);
      const growth = roundMoney(balance * capitalRate);
      balance = roundMoney(balance + growth);
      const dividend = roundMoney(balance * yieldRate);
      cashDividends = roundMoney(cashDividends + dividend);
      totalContributed = roundMoney(totalContributed + contributed);
      yearRows.push({
        year,
        contributed,
        growth,
        dividend,
        endingBalance: balance,
        totalWealth: roundMoney(balance + cashDividends),
      });
    }
  } else {
    for (let year = 1; year <= termYears; year += 1) {
      const contributed = roundMoney(contribution * 12);
      balance = roundMoney(balance + contributed);
      const growth = roundMoney(balance * capitalRate);
      balance = roundMoney(balance + growth);
      const dividend = roundMoney(balance * yieldRate);
      balance = roundMoney(balance + dividend);
      totalContributed = roundMoney(totalContributed + contributed);
      yearRows.push({
        year,
        contributed,
        growth,
        dividend,
        endingBalance: balance,
        totalWealth: balance,
      });
    }
  }

  const futureValue = roundMoney(balance);
  const totalWealth =
    growthType === "DIVIDEND"
      ? roundMoney(futureValue + cashDividends)
      : futureValue;
  const gain = roundMoney(totalWealth - totalContributed);

  return {
    years: yearRows,
    months,
    totalContributed: roundMoney(totalContributed),
    futureValue,
    totalDividends: roundMoney(cashDividends),
    totalWealth,
    gain,
  };
}
