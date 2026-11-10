"use server";

import { revalidatePath } from "next/cache";
import { parseDebtFormData } from "@/lib/debt-form";
import { prisma } from "@/lib/prisma";

export type DebtActionState = {
  error?: string;
  success?: boolean;
};

function revalidateDebts() {
  revalidatePath("/");
  revalidatePath("/debts");
}

export async function createDebt(
  _prevState: DebtActionState,
  formData: FormData
): Promise<DebtActionState> {
  try {
    const data = parseDebtFormData(formData);

    await prisma.debt.create({
      data: {
        name: data.name,
        category: data.category,
        loanAmount: data.loanAmount,
        monthlyPayment: data.monthlyPayment,
        fee: data.fee,
        interestRate: data.interestRate,
        interestType: data.interestType,
        paymentDueDay: data.paymentDueDay,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });

    revalidateDebts();
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to add debt",
    };
  }
}

export async function updateDebt(
  id: string,
  _prevState: DebtActionState,
  formData: FormData
): Promise<DebtActionState> {
  try {
    const data = parseDebtFormData(formData);

    await prisma.debt.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        loanAmount: data.loanAmount,
        monthlyPayment: data.monthlyPayment,
        fee: data.fee,
        interestRate: data.interestRate,
        interestType: data.interestType,
        paymentDueDay: data.paymentDueDay,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });

    revalidateDebts();
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update debt",
    };
  }
}

export async function deleteDebt(id: string, _formData?: FormData) {
  await prisma.debt.delete({ where: { id } });
  revalidateDebts();
}
