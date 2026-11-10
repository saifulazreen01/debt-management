import { ASSET_CATEGORIES, getAssetCategoryLabel } from "@/lib/asset-categories";
import type { Asset, AssetYearValue } from "@/lib/generated/prisma/client";
import type { AssetCategory } from "@/lib/generated/prisma/enums";

export type AssetWithYearValues = Asset & {
  yearValues: AssetYearValue[];
};

export type AssetCategoryRow = {
  category: AssetCategory;
  label: string;
  count: number;
  purchaseTotal: number;
  currentWorth: number;
};

export function getLatestYearValue(
  asset: AssetWithYearValues,
  asOfYear = new Date().getFullYear()
) {
  if (asset.yearValues.length === 0) return null;

  const sorted = [...asset.yearValues].sort((a, b) => b.year - a.year);
  const atOrBefore = sorted.find((entry) => entry.year <= asOfYear);
  return atOrBefore ?? sorted[0];
}

export function getAssetCurrentWorth(
  asset: AssetWithYearValues,
  asOfYear = new Date().getFullYear()
) {
  return getLatestYearValue(asset, asOfYear)?.worth ?? asset.purchasePrice;
}

export function getAssetGainLoss(
  asset: AssetWithYearValues,
  asOfYear = new Date().getFullYear()
) {
  return getAssetCurrentWorth(asset, asOfYear) - asset.purchasePrice;
}

export function getTotalPurchasePrice(assets: AssetWithYearValues[]) {
  return assets.reduce((sum, asset) => sum + asset.purchasePrice, 0);
}

export function getTotalCurrentWorth(
  assets: AssetWithYearValues[],
  asOfYear = new Date().getFullYear()
) {
  return assets.reduce(
    (sum, asset) => sum + getAssetCurrentWorth(asset, asOfYear),
    0
  );
}

export function getAssetCategoryReport(
  assets: AssetWithYearValues[],
  asOfYear = new Date().getFullYear()
): AssetCategoryRow[] {
  const byCategory = new Map<
    AssetCategory,
    { count: number; purchaseTotal: number; currentWorth: number }
  >();

  for (const category of ASSET_CATEGORIES) {
    byCategory.set(category, {
      count: 0,
      purchaseTotal: 0,
      currentWorth: 0,
    });
  }

  for (const asset of assets) {
    const row = byCategory.get(asset.category);
    if (!row) continue;
    row.count += 1;
    row.purchaseTotal += asset.purchasePrice;
    row.currentWorth += getAssetCurrentWorth(asset, asOfYear);
  }

  return ASSET_CATEGORIES.map((category) => {
    const row = byCategory.get(category)!;
    return {
      category,
      label: getAssetCategoryLabel(category),
      ...row,
    };
  });
}

export function groupAssetsByYear(assets: AssetWithYearValues[]) {
  const years = new Map<
    number,
    { purchaseTotal: number; worthTotal: number; count: number }
  >();

  for (const asset of assets) {
    for (const entry of asset.yearValues) {
      const row = years.get(entry.year) ?? {
        purchaseTotal: 0,
        worthTotal: 0,
        count: 0,
      };
      row.worthTotal += entry.worth;
      row.count += 1;
      years.set(entry.year, row);
    }

    const purchaseRow = years.get(asset.purchaseYear) ?? {
      purchaseTotal: 0,
      worthTotal: 0,
      count: 0,
    };
    purchaseRow.purchaseTotal += asset.purchasePrice;
    years.set(asset.purchaseYear, purchaseRow);
  }

  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, row]) => ({ year, ...row }));
}

export function availableAssetYears(
  assets: AssetWithYearValues[],
  fallbackYear = new Date().getFullYear()
) {
  const years = new Set<number>([fallbackYear]);
  for (const asset of assets) {
    years.add(asset.purchaseYear);
    for (const entry of asset.yearValues) {
      years.add(entry.year);
    }
  }
  return [...years].sort((a, b) => b - a);
}
