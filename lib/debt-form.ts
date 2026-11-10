import { isDebtCategory } from "@/lib/debt-categories";
import {
  calculateMonthlyPaymentFromInterest,
  estimateAnnualRateFromPayment,
  getLoanTermMonths,
  paymentsMatch,
} from "@/lib/debts";
import {
  parseAmount,
  parseDate,
  parseDueDay,
  parseOptionalAmount,
} from "@/lib/form";
import type {
  DebtCategory,
  InterestType,
} from "@/lib/generated/prisma/enums";

function isInterestType(value: string): value is InterestType {
  return value === "FIXED" || value === "VARIABLE";
}

export type DebtEntryMode = "simple" | "advanced";

export type ParsedDebtInput = {
  name: string;
  category: DebtCategory;
  loanAmount: number;
  monthlyPayment: number;
  fee: number;
  interestRate: number | null;
  interestType: InterestType | null;
  paymentDueDay: number;
  startDate: Date;
  endDate: Date;
  entryMode: DebtEntryMode;
};

export function parseDebtFormData(formData: FormData): ParsedDebtInput {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Debt name is required");
  }

  const categoryValue = String(formData.get("category") ?? "");
  if (!isDebtCategory(categoryValue)) {
    throw new Error("Select a valid debt category");
  }

  const modeValue = String(formData.get("entryMode") ?? "simple");
  const entryMode: DebtEntryMode =
    modeValue === "advanced" ? "advanced" : "simple";

  const loanAmount = parseAmount(formData.get("loanAmount"), "Loan amount");
  const fee = parseAmount(formData.get("fee") ?? "0", "Fee");
  const paymentDueDay = parseDueDay(formData.get("paymentDueDay"));
  const startDate = parseDate(formData.get("startDate"), "Start date");
  const endDate = parseDate(formData.get("endDate"), "End date");

  if (endDate < startDate) {
    throw new Error("End date must be on or after start date");
  }

  const months = getLoanTermMonths(startDate, endDate);

  if (entryMode === "simple") {
    const monthlyPayment = parseAmount(
      formData.get("monthlyPayment"),
      "Monthly payment"
    );
    const estimatedRate = estimateAnnualRateFromPayment({
      principal: loanAmount,
      monthlyPayment,
      months,
    });

    return {
      name,
      category: categoryValue,
      loanAmount,
      monthlyPayment,
      fee,
      interestRate: estimatedRate,
      interestType: estimatedRate != null && estimatedRate > 0 ? "FIXED" : null,
      paymentDueDay,
      startDate,
      endDate,
      entryMode,
    };
  }

  const interestRate = parseAmount(
    formData.get("interestRate"),
    "Interest rate"
  );
  const interestTypeValue = String(formData.get("interestType") ?? "").trim();
  if (!isInterestType(interestTypeValue)) {
    throw new Error("Select fixed or variable interest");
  }

  const calculatedMonthly = calculateMonthlyPaymentFromInterest({
    principal: loanAmount,
    annualRatePercent: interestRate,
    months,
  });

  if (calculatedMonthly <= 0) {
    throw new Error("Could not calculate monthly payment from the details given");
  }

  const statementMonthly = parseOptionalAmount(
    formData.get("statementMonthly")
  );
  const useStatement = String(formData.get("useStatementMonthly") ?? "") === "1";

  let monthlyPayment = calculatedMonthly;
  if (statementMonthly != null && statementMonthly > 0) {
    if (useStatement) {
      monthlyPayment = statementMonthly;
    } else if (!paymentsMatch(calculatedMonthly, statementMonthly)) {
      throw new Error(
        `Statement installment (${statementMonthly.toFixed(2)}) does not match calculated (${calculatedMonthly.toFixed(2)}). Adjust rate, tenure, or fees — or confirm using your statement amount.`
      );
    } else {
      monthlyPayment = statementMonthly;
    }
  }

  return {
    name,
    category: categoryValue,
    loanAmount,
    monthlyPayment,
    fee,
    interestRate,
    interestType: interestTypeValue,
    paymentDueDay,
    startDate,
    endDate,
    entryMode,
  };
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
