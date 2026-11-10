import type { AssetCategory } from "@/lib/generated/prisma/enums";

export const ASSET_CATEGORIES = [
  "VEHICLE",
  "PROPERTY",
  "ELECTRONICS",
  "JEWELRY",
  "FURNITURE",
  "OTHER",
] as const satisfies readonly AssetCategory[];

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  VEHICLE: "Vehicle",
  PROPERTY: "Property",
  ELECTRONICS: "Electronics",
  JEWELRY: "Jewelry",
  FURNITURE: "Furniture",
  OTHER: "Other",
};

export function isAssetCategory(value: string): value is AssetCategory {
  return (ASSET_CATEGORIES as readonly string[]).includes(value);
}

export function getAssetCategoryLabel(category: AssetCategory) {
  return ASSET_CATEGORY_LABELS[category];
}
