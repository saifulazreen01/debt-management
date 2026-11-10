"use client";

import { useActionState, useEffect, useState } from "react";
import {
  upsertAssetYearValue,
  type AssetActionState,
} from "@/app/actions/assets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/hooks/use-action-toast";
import type { AssetYearValue } from "@/lib/generated/prisma/client";

const initialState: AssetActionState = {};
const currentYear = new Date().getFullYear();

export function AssetYearDialog({
  assetId,
  assetName,
  yearValues,
}: {
  assetId: string;
  assetName: string;
  yearValues: AssetYearValue[];
}) {
  const [open, setOpen] = useState(false);
  const upsert = upsertAssetYearValue.bind(null, assetId);
  const [state, formAction, pending] = useActionState(upsert, initialState);
  const latest = [...yearValues].sort((a, b) => b.year - a.year)[0];

  useActionToast(state, pending, { successMessage: "Yearly worth saved" });

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="ghost" size="sm" />}>
        Update year
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yearly worth</DialogTitle>
          <DialogDescription>
            Save what {assetName} is worth for a specific year. Existing years
            are overwritten.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`asset-year-${assetId}`}>Year</Label>
            <Input
              id={`asset-year-${assetId}`}
              name="year"
              type="number"
              min="1970"
              max={currentYear + 1}
              step="1"
              defaultValue={latest?.year ?? currentYear}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`asset-worth-${assetId}`}>Worth</Label>
            <Input
              id={`asset-worth-${assetId}`}
              name="worth"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              defaultValue={latest?.worth}
              required
            />
          </div>
          {yearValues.length > 0 ? (
            <div className="rounded-xl border border-white/35 bg-white/25 p-3 text-xs text-muted-foreground dark:border-white/10 dark:bg-white/5">
              Saved years:{" "}
              {[...yearValues]
                .sort((a, b) => b.year - a.year)
                .map((entry) => entry.year)
                .join(", ")}
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save year"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
