import { formatCurrency, formatDate } from "@/lib/debts";
import type { Debt, DebtPayment } from "@/lib/generated/prisma/client";

export type DebtPaymentWithDebt = DebtPayment & { debt: Debt };

export type PaymentSignal = "on_track" | "extra" | "short" | "late";

export type PaymentInsight = {
  payment: DebtPaymentWithDebt;
  dueDate: Date;
  difference: number;
  isLate: boolean;
  isExtra: boolean;
  isShort: boolean;
  signals: PaymentSignal[];
  summary: string;
};

export function getPeriodDueDate(
  debt: Pick<Debt, "paymentDueDay">,
  periodYear: number,
  periodMonth: number
) {
  const daysInMonth = new Date(periodYear, periodMonth, 0).getDate();
  const day = Math.min(debt.paymentDueDay, daysInMonth);
  return new Date(periodYear, periodMonth - 1, day);
}

export function formatPeriodLabel(periodYear: number, periodMonth: number) {
  return new Intl.DateTimeFormat("en-MY", {
    month: "short",
    year: "numeric",
  }).format(new Date(periodYear, periodMonth - 1, 1));
}

export function getPaymentDifference(payment: Pick<DebtPayment, "amount" | "expectedAmount">) {
  return Math.round((payment.amount - payment.expectedAmount) * 100) / 100;
}

export function getPaymentInsight(payment: DebtPaymentWithDebt): PaymentInsight {
  const dueDate = getPeriodDueDate(
    payment.debt,
    payment.periodYear,
    payment.periodMonth
  );
  const difference = getPaymentDifference(payment);
  const paidDayStart = new Date(
    payment.paidAt.getFullYear(),
    payment.paidAt.getMonth(),
    payment.paidAt.getDate()
  );
  const dueDayStart = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );
  const isLate = paidDayStart.getTime() > dueDayStart.getTime();
  const isExtra = difference > 0.009;
  const isShort = difference < -0.009;
  const signals: PaymentSignal[] = [];

  if (isExtra) signals.push("extra");
  if (isShort) signals.push("short");
  if (isLate) signals.push("late");
  if (signals.length === 0) signals.push("on_track");

  let summary = "Paid as scheduled.";
  if (isExtra && isLate) {
    summary = `Paid late and ${formatCurrency(difference)} more than the installment — likely fee, penalty, or late interest.`;
  } else if (isExtra) {
    summary = `Paid ${formatCurrency(difference)} more than the installment — check for fee, penalty, or added interest.`;
  } else if (isShort && isLate) {
    summary = `Paid late and ${formatCurrency(Math.abs(difference))} short of the installment.`;
  } else if (isShort) {
    summary = `Paid ${formatCurrency(Math.abs(difference))} short of the installment.`;
  } else if (isLate) {
    summary = `Paid after due date (${formatDate(dueDate)}). Watch for late charges next statement.`;
  }

  return {
    payment,
    dueDate,
    difference,
    isLate,
    isExtra,
    isShort,
    signals,
    summary,
  };
}

export function getPaymentInsights(payments: DebtPaymentWithDebt[]) {
  return payments.map(getPaymentInsight);
}

export function countExtraPayments(insights: PaymentInsight[]) {
  return insights.filter((item) => item.isExtra).length;
}
