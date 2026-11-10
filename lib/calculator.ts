import {
  buildAmortizationSchedule,
  getLoanRateTypeLabel,
  type AmortizationSchedule,
  type LoanRateType,
} from "@/lib/amortization";
import {
  buildInvestmentProjection,
  getInvestmentGrowthTypeLabel,
  type InvestmentGrowthType,
  type InvestmentProjection,
} from "@/lib/investment-projection";

export type CalculatorMode = "investments" | "loans";

export type InvestmentScenarioInput = {
  id: string;
  name: string;
  initialAmount: number;
  monthlyContribution: number;
  annualReturnPercent: number;
  years: number;
  growthType: InvestmentGrowthType;
  capitalGrowthPercent: number;
};

export type InvestmentScenarioResult = InvestmentScenarioInput & {
  months: number;
  totalContributed: number;
  futureValue: number;
  totalDividends: number;
  totalWealth: number;
  gain: number;
  schedule: InvestmentProjection;
  growthTypeLabel: string;
};

export type LoanScenarioInput = {
  id: string;
  name: string;
  principal: number;
  annualRatePercent: number;
  years: number;
  rateType: LoanRateType;
  revisedRatePercent: number;
  fixedPeriodYears: number;
};

export type LoanScenarioResult = LoanScenarioInput & {
  months: number;
  monthlyPayment: number;
  monthlyPaymentEnd: number;
  totalPaid: number;
  totalInterest: number;
  schedule: AmortizationSchedule;
  rateTypeLabel: string;
};

export function projectInvestment({
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
  capitalGrowthPercent?: number;
}) {
  const schedule = buildInvestmentProjection({
    initialAmount,
    monthlyContribution,
    annualReturnPercent,
    years,
    growthType,
    capitalGrowthPercent,
  });

  return {
    months: schedule.months,
    totalContributed: schedule.totalContributed,
    futureValue: schedule.futureValue,
    totalDividends: schedule.totalDividends,
    totalWealth: schedule.totalWealth,
    gain: schedule.gain,
    schedule,
    growthTypeLabel: getInvestmentGrowthTypeLabel(growthType),
  };
}

export function compareInvestments(
  scenarios: InvestmentScenarioInput[]
): InvestmentScenarioResult[] {
  return scenarios.map((scenario) => ({
    ...scenario,
    ...projectInvestment(scenario),
  }));
}

export function bestInvestmentId(results: InvestmentScenarioResult[]) {
  if (results.length === 0) return null;
  return results.reduce((best, current) =>
    current.totalWealth > best.totalWealth ? current : best
  ).id;
}

export function projectLoan({
  principal,
  annualRatePercent,
  years,
  rateType = "FIXED",
  revisedRatePercent,
  fixedPeriodYears = 3,
}: {
  principal: number;
  annualRatePercent: number;
  years: number;
  rateType?: LoanRateType;
  revisedRatePercent?: number;
  fixedPeriodYears?: number;
}) {
  const schedule = buildAmortizationSchedule({
    principal,
    annualRatePercent,
    years,
    rateType,
    revisedRatePercent,
    fixedPeriodYears,
  });

  return {
    months: schedule.termMonths,
    monthlyPayment: schedule.monthlyPaymentStart,
    monthlyPaymentEnd: schedule.monthlyPaymentEnd,
    totalPaid: schedule.totalPaid,
    totalInterest: schedule.totalInterest,
    schedule,
    rateTypeLabel: getLoanRateTypeLabel(rateType),
  };
}

export function compareLoans(scenarios: LoanScenarioInput[]): LoanScenarioResult[] {
  return scenarios.map((scenario) => ({
    ...scenario,
    ...projectLoan(scenario),
  }));
}

export function bestLoanId(results: LoanScenarioResult[]) {
  if (results.length === 0) return null;
  return results.reduce((best, current) => {
    if (current.totalPaid < best.totalPaid) return current;
    if (current.totalPaid === best.totalPaid) {
      return current.monthlyPayment < best.monthlyPayment ? current : best;
    }
    return best;
  }).id;
}

export type {
  AmortizationSchedule,
  InvestmentGrowthType,
  InvestmentProjection,
  LoanRateType,
};
