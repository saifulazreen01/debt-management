"use server";

import { revalidatePath } from "next/cache";
import { parseAmount, parseDate } from "@/lib/form";
import { isIncomeCategory } from "@/lib/income-categories";
import { prisma } from "@/lib/prisma";

export type IncomeActionState = {
  error?: string;
  success?: boolean;
};

export async function createIncome(
  _prevState: IncomeActionState,
  formData: FormData
): Promise<IncomeActionState> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      return { error: "Income name is required" };
    }

    const categoryValue = String(formData.get("category") ?? "");
    if (!isIncomeCategory(categoryValue)) {
      return { error: "Select a valid income category" };
    }

    const monthlyAmount = parseAmount(
      formData.get("monthlyAmount"),
      "Monthly amount"
    );
    if (monthlyAmount <= 0) {
      return { error: "Monthly amount must be greater than 0" };
    }

    const startRaw = String(formData.get("startDate") ?? "").trim();
    const endRaw = String(formData.get("endDate") ?? "").trim();

    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (categoryValue === "LEASING") {
      startDate = parseDate(formData.get("startDate"), "Start date");
      endDate = parseDate(formData.get("endDate"), "End date");
      if (endDate < startDate) {
        return { error: "End date must be on or after start date" };
      }
    } else {
      if (startRaw) {
        startDate = parseDate(formData.get("startDate"), "Start date");
      }
      if (endRaw) {
        endDate = parseDate(formData.get("endDate"), "End date");
      }
      if (startDate && endDate && endDate < startDate) {
        return { error: "End date must be on or after start date" };
      }
    }

    await prisma.income.create({
      data: {
        name,
        category: categoryValue,
        monthlyAmount,
        startDate,
        endDate,
      },
    });

    revalidatePath("/");
    revalidatePath("/incomes");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to add income",
    };
  }
}

export async function deleteIncome(id: string, _formData?: FormData) {
  await prisma.income.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/incomes");
}
