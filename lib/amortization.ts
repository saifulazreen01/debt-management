import { calculateMonthlyPaymentFromInterest } from "@/lib/debts";

export type LoanRateType = "FIXED" | "VARIABLE";

export type AmortizationMonth = {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  ratePercent: number;
};

export type AmortizationYear = {
  year: number;
  payment: number;
  principal: number;
  interest: number;
  endingBalance: number;
  ratePercent: number;
};

export type AmortizationSchedule = {
  months: AmortizationMonth[];
  years: AmortizationYear[];
  monthlyPaymentStart: number;
  monthlyPaymentEnd: number;
  totalPaid: number;
  totalInterest: number;
  termMonths: number;
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function paymentForBalance({
  balance,
  annualRatePercent,
  remainingMonths,
}: {
  balance: number;
  annualRatePercent: number;
  remainingMonths: number;
}) {
  return roundMoney(
    calculateMonthlyPaymentFromInterest({
      principal: balance,
      annualRatePercent: Math.max(0, annualRatePercent),
      months: Math.max(1, remainingMonths),
    })
  );
}

/**
 * Builds a reducing-balance amortization schedule.
 * FIXED keeps one rate and installment for the full tenure.
 * VARIABLE keeps the start rate for `fixedPeriodYears`, then switches to
 * `revisedRatePercent` and recalculates the installment on the remaining balance.
 */
export function buildAmortizationSchedule({
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
}): AmortizationSchedule {
  const termMonths = Math.max(1, Math.round(years * 12));
  const startBalance = Math.max(0, principal);
  const startRate = Math.max(0, annualRatePercent);
  const laterRate =
    rateType === "VARIABLE"
      ? Math.max(0, revisedRatePercent ?? annualRatePercent)
      : startRate;
  const reviewAfterMonths =
    rateType === "VARIABLE"
      ? Math.min(
          termMonths,
          Math.max(0, Math.round(Math.max(0, fixedPeriodYears) * 12))
        )
      : termMonths;

  const months: AmortizationMonth[] = [];
  let balance = startBalance;
  let currentRate = startRate;
  let installment = paymentForBalance({
    balance,
    annualRatePercent: currentRate,
    remainingMonths: termMonths,
  });
  const monthlyPaymentStart = installment;

  for (let month = 1; month <= termMonths; month += 1) {
    if (
      rateType === "VARIABLE" &&
      month === reviewAfterMonths + 1 &&
      laterRate !== currentRate
    ) {
      currentRate = laterRate;
      installment = paymentForBalance({
        balance,
        annualRatePercent: currentRate,
        remainingMonths: termMonths - month + 1,
      });
    }

    const monthlyRate = currentRate / 100 / 12;
    const interest = roundMoney(balance * monthlyRate);
    const isLast = month === termMonths;
    let payment = installment;
    let principalPaid = roundMoney(payment - interest);

    if (isLast || principalPaid >= balance) {
      principalPaid = roundMoney(balance);
      payment = roundMoney(principalPaid + interest);
      balance = 0;
    } else {
      balance = roundMoney(balance - principalPaid);
    }

    months.push({
      month,
      year: Math.ceil(month / 12),
      payment,
      principal: principalPaid,
      interest,
      balance,
      ratePercent: currentRate,
    });

    if (balance <= 0) break;
  }

  const yearsMap = new Map<number, AmortizationYear>();
  for (const row of months) {
    const existing = yearsMap.get(row.year);
    if (!existing) {
      yearsMap.set(row.year, {
        year: row.year,
        payment: row.payment,
        principal: row.principal,
        interest: row.interest,
        endingBalance: row.balance,
        ratePercent: row.ratePercent,
      });
    } else {
      existing.payment = roundMoney(existing.payment + row.payment);
      existing.principal = roundMoney(existing.principal + row.principal);
      existing.interest = roundMoney(existing.interest + row.interest);
      existing.endingBalance = row.balance;
      existing.ratePercent = row.ratePercent;
    }
  }

  const yearRows = [...yearsMap.values()].sort((a, b) => a.year - b.year);
  const totalPaid = roundMoney(months.reduce((sum, row) => sum + row.payment, 0));
  const totalInterest = roundMoney(
    months.reduce((sum, row) => sum + row.interest, 0)
  );
  const monthlyPaymentEnd = months.at(-1)?.payment ?? monthlyPaymentStart;

  return {
    months,
    years: yearRows,
    monthlyPaymentStart,
    monthlyPaymentEnd: roundMoney(monthlyPaymentEnd),
    totalPaid,
    totalInterest,
    termMonths: months.length,
  };
}

export function getLoanRateTypeLabel(type: LoanRateType) {
  return type === "FIXED" ? "Fixed rate" : "Variable rate";
}
