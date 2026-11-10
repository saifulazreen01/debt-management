import { deleteAsset } from "@/app/actions/assets";
import { AssetYearDialog } from "@/components/form/asset-year-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAssetCategoryLabel } from "@/lib/asset-categories";
import {
  getAssetCurrentWorth,
  getAssetGainLoss,
  getLatestYearValue,
  type AssetWithYearValues,
} from "@/lib/assets";
import { formatCurrency } from "@/lib/debts";

export function AssetList({
  assets,
  asOfYear,
}: {
  assets: AssetWithYearValues[];
  asOfYear: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset listing</CardTitle>
        <CardDescription>
          {assets.length === 0
            ? "No assets yet — purchase vs current worth stays empty."
            : `${assets.length} asset${assets.length === 1 ? "" : "s"} · values as of ${asOfYear}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add something you own to compare buy price against yearly worth.
          </p>
        ) : (
          assets.map((asset) => {
            const currentWorth = getAssetCurrentWorth(asset, asOfYear);
            const gainLoss = getAssetGainLoss(asset, asOfYear);
            const latest = getLatestYearValue(asset, asOfYear);
            const gainPositive = gainLoss >= 0;

            return (
              <div
                key={asset.id}
                className="flex flex-col gap-3 border-b border-border/70 py-3 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="grid min-w-0 gap-1">
                  <p className="font-medium">{asset.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getAssetCategoryLabel(asset.category)} · bought{" "}
                    {asset.purchaseYear}
                    {latest ? ` · worth year ${latest.year}` : ""}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span>
                      Bought{" "}
                      <span className="font-mono font-medium">
                        {formatCurrency(asset.purchasePrice)}
                      </span>
                    </span>
                    <span>
                      Worth{" "}
                      <span className="font-mono font-medium">
                        {formatCurrency(currentWorth)}
                      </span>
                    </span>
                    <span
                      className={
                        gainPositive
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-destructive"
                      }
                    >
                      {gainPositive ? "+" : "−"}
                      {formatCurrency(Math.abs(gainLoss))}
                    </span>
                  </div>
                  {asset.notes ? (
                    <p className="text-xs text-muted-foreground">{asset.notes}</p>
                  ) : null}
                  {asset.yearValues.length > 1 ? (
                    <p className="text-xs text-muted-foreground">
                      History:{" "}
                      {[...asset.yearValues]
                        .sort((a, b) => b.year - a.year)
                        .map(
                          (entry) =>
                            `${entry.year} ${formatCurrency(entry.worth)}`
                        )
                        .join(" · ")}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <AssetYearDialog
                    assetId={asset.id}
                    assetName={asset.name}
                    yearValues={asset.yearValues}
                  />
                  <form action={deleteAsset.bind(null, asset.id)}>
                    <Button type="submit" variant="ghost" size="sm">
                      Remove
                    </Button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
