import { Suspense } from "react";
import { io } from "next/cache";
import { AssetList } from "@/components/asset-list";
import { AssetReport } from "@/components/asset-report";
import { AssetFormDialog } from "@/components/form/asset-form-dialog";
import { PageFrame } from "@/components/page-frame";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getAssetCategoryReport,
  getTotalCurrentWorth,
  getTotalPurchasePrice,
  groupAssetsByYear,
} from "@/lib/assets";
import { formatCurrency } from "@/lib/debts";
import { prisma } from "@/lib/prisma";

async function AssetsContent() {
  await io();

  const asOfYear = new Date().getFullYear();
  const assets = await prisma.asset.findMany({
    include: { yearValues: true },
    orderBy: [{ category: "asc" }, { purchaseYear: "desc" }, { name: "asc" }],
  });

  const purchaseTotal = getTotalPurchasePrice(assets);
  const currentWorth = getTotalCurrentWorth(assets, asOfYear);
  const gainLoss = currentWorth - purchaseTotal;
  const categoryReport = getAssetCategoryReport(assets, asOfYear);
  const yearRows = groupAssetsByYear(assets);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Bought for</CardDescription>
            <CardTitle className="font-mono text-3xl tracking-tight">
              {formatCurrency(purchaseTotal)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Worth in {asOfYear}</CardDescription>
            <CardTitle className="font-mono text-3xl tracking-tight">
              {formatCurrency(currentWorth)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Gain / loss</CardDescription>
            <CardTitle
              className={`font-mono text-3xl tracking-tight ${
                gainLoss >= 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-destructive"
              }`}
            >
              {gainLoss >= 0 ? "+" : "−"}
              {formatCurrency(Math.abs(gainLoss))}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <AssetReport rows={categoryReport} yearRows={yearRows} />
      <AssetList assets={assets} asOfYear={asOfYear} />
    </>
  );
}

export default function AssetsPage() {
  return (
    <PageFrame>
      <PageHeader
        page="assets"
        title="Assets"
        description="List what you bought, the purchase price, and yearly worth over time."
        actions={<AssetFormDialog />}
      />
      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardDescription>Worth now</CardDescription>
              <CardTitle className="font-mono text-3xl tracking-tight">
                {formatCurrency(0)}
              </CardTitle>
            </CardHeader>
          </Card>
        }
      >
        <AssetsContent />
      </Suspense>
    </PageFrame>
  );
}
