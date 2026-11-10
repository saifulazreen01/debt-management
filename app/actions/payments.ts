"use server";

import { revalidatePath } from "next/cache";
import { parseAmount, parseDate } from "@/lib/form";
import { prisma } from "@/lib/prisma";

export type PaymentActionState = {
  error?: string;
  success?: boolean;
};

function revalidatePayments() {
  revalidatePath("/");
  revalidatePath("/debts");
}

function parsePeriodMonth(value: FormDataEntryValue | null) {
  const month = Number(value);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Payment month must be between 1 and 12");
  }
  return month;
}

function parsePeriodYear(value: FormDataEntryValue | null) {
  const year = Number(value);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error("Payment year is invalid");
  }
  return year;
}

export async function createDebtPayment(
  _prevState: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  try {
    const debtId = String(formData.get("debtId") ?? "").trim();
    if (!debtId) {
      throw new Error("Select a debt");
    }

    const debt = await prisma.debt.findUnique({ where: { id: debtId } });
    if (!debt) {
      throw new Error("Debt not found");
    }

    const periodYear = parsePeriodYear(formData.get("periodYear"));
    const periodMonth = parsePeriodMonth(formData.get("periodMonth"));
    const paidAt = parseDate(formData.get("paidAt"), "Payment date");
    const amount = parseAmount(formData.get("amount"), "Amount paid");
    const notesRaw = String(formData.get("notes") ?? "").trim();
    const notes = notesRaw.length > 0 ? notesRaw : null;

    if (amount <= 0) {
      throw new Error("Amount paid must be greater than 0");
    }

    await prisma.debtPayment.upsert({
      where: {
        debtId_periodYear_periodMonth: {
          debtId,
          periodYear,
          periodMonth,
        },
      },
      create: {
        debtId,
        periodYear,
        periodMonth,
        paidAt,
        amount,
        expectedAmount: debt.monthlyPayment,
        notes,
      },
      update: {
        paidAt,
        amount,
        expectedAmount: debt.monthlyPayment,
        notes,
      },
    });

    revalidatePayments();
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to save payment",
    };
  }
}

export async function deleteDebtPayment(id: string, _formData?: FormData) {
  await prisma.debtPayment.delete({ where: { id } });
  revalidatePayments();
}
