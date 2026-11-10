"use server";

import { revalidatePath } from "next/cache";
import { parseAmount, parseOptionalAmount } from "@/lib/form";
import { isContributionType } from "@/lib/investments";
import { isInvestmentCategory } from "@/lib/investment-categories";
import { prisma } from "@/lib/prisma";

export type InvestmentActionState = {
  error?: string;
  success?: boolean;
};

function revalidateInvestments() {
  revalidatePath("/");
  revalidatePath("/investments");
}

export async function createInvestment(
  _prevState: InvestmentActionState,
  formData: FormData
): Promise<InvestmentActionState> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      return { error: "Investment name is required" };
    }

    const categoryValue = String(formData.get("category") ?? "");
    if (!isInvestmentCategory(categoryValue)) {
      return { error: "Select a valid investment category" };
    }

    const amount = parseAmount(formData.get("amount"), "Current amount");
    if (amount <= 0) {
      return { error: "Current amount must be greater than 0" };
    }

    const contributionTypeValue = String(
      formData.get("contributionType") ?? "NONE"
    );
    if (!isContributionType(contributionTypeValue)) {
      return { error: "Select a valid contribution type" };
    }

    let contributionValue = parseOptionalAmount(
      formData.get("contributionValue")
    );

    if (contributionTypeValue === "NONE") {
      contributionValue = null;
    } else {
      if (contributionValue == null || contributionValue <= 0) {
        return {
          error:
            contributionTypeValue === "FIXED"
              ? "Enter a monthly fixed contribution amount"
              : "Enter a monthly contribution percentage",
        };
      }
      if (contributionTypeValue === "PERCENTAGE" && contributionValue > 100) {
        return { error: "Percentage cannot be more than 100" };
      }
    }

    await prisma.investment.create({
      data: {
        name,
        category: categoryValue,
        amount,
        contributionType: contributionTypeValue,
        contributionValue,
      },
    });

    revalidateInvestments();
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to add investment",
    };
  }
}

export async function deleteInvestment(id: string, _formData?: FormData) {
  await prisma.investment.delete({ where: { id } });
  revalidateInvestments();
}
