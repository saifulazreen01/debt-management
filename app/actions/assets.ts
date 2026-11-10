"use server";

import { revalidatePath } from "next/cache";
import { isAssetCategory } from "@/lib/asset-categories";
import { parseAmount } from "@/lib/form";
import { prisma } from "@/lib/prisma";

export type AssetActionState = {
  error?: string;
  success?: boolean;
};

function revalidateAssets() {
  revalidatePath("/");
  revalidatePath("/assets");
}

function parseYear(value: FormDataEntryValue | null, label: string) {
  const year = Number(value);
  const current = new Date().getFullYear();
  if (!Number.isInteger(year) || year < 1970 || year > current + 1) {
    throw new Error(`${label} must be a valid year`);
  }
  return year;
}

export async function createAsset(
  _prevState: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      return { error: "Asset name is required" };
    }

    const categoryValue = String(formData.get("category") ?? "");
    if (!isAssetCategory(categoryValue)) {
      return { error: "Select a valid asset category" };
    }

    const purchasePrice = parseAmount(
      formData.get("purchasePrice"),
      "Purchase price"
    );
    if (purchasePrice <= 0) {
      return { error: "Purchase price must be greater than 0" };
    }

    const purchaseYear = parseYear(
      formData.get("purchaseYear"),
      "Purchase year"
    );
    const worthYear = parseYear(
      formData.get("worthYear") ?? String(purchaseYear),
      "Worth year"
    );
    const currentWorth = parseAmount(
      formData.get("currentWorth"),
      "Current worth"
    );
    const notes = String(formData.get("notes") ?? "").trim() || null;

    await prisma.asset.create({
      data: {
        name,
        category: categoryValue,
        purchasePrice,
        purchaseYear,
        notes,
        yearValues: {
          create: {
            year: worthYear,
            worth: currentWorth,
          },
        },
      },
    });

    revalidateAssets();
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to add asset",
    };
  }
}

export async function upsertAssetYearValue(
  assetId: string,
  _prevState: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
  try {
    const year = parseYear(formData.get("year"), "Year");
    const worth = parseAmount(formData.get("worth"), "Worth");

    await prisma.assetYearValue.upsert({
      where: {
        assetId_year: {
          assetId,
          year,
        },
      },
      create: {
        assetId,
        year,
        worth,
      },
      update: {
        worth,
      },
    });

    revalidateAssets();
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to save yearly worth",
    };
  }
}

export async function deleteAsset(id: string, _formData?: FormData) {
  await prisma.asset.delete({ where: { id } });
  revalidateAssets();
}
