"use client";

import { useActionState, useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { createAsset, type AssetActionState } from "@/app/actions/assets";
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
import {
  ASSET_CATEGORIES,
  ASSET_CATEGORY_LABELS,
} from "@/lib/asset-categories";

const initialState: AssetActionState = {};
const currentYear = new Date().getFullYear();

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-white/40 px-2.5 py-1 text-base outline-none transition-colors backdrop-blur-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30";

export function AssetFormDialog() {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(createAsset, initialState);

  useActionToast(state, pending, { successMessage: "Asset added" });

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      setFormKey((key) => key + 1);
    }
  }, [state.success]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setFormKey((key) => key + 1);
      }}
    >
      <DialogTrigger render={<Button type="button" />}>
        <PlusIcon data-icon="inline-start" />
        Add asset
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add asset</DialogTitle>
          <DialogDescription>
            Record what you bought, the purchase price, and what it is worth for
            a selected year.
          </DialogDescription>
        </DialogHeader>
        <form
          key={formKey}
          action={formAction}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="asset-name">Asset name</Label>
            <Input
              id="asset-name"
              name="name"
              placeholder="Honda City, MacBook Pro, gold chain…"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="asset-category">Category</Label>
            <select
              id="asset-category"
              name="category"
              required
              defaultValue=""
              className={selectClassName}
            >
              <option value="" disabled>
                Select category
              </option>
              {ASSET_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {ASSET_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="asset-purchaseYear">Purchase year</Label>
            <Input
              id="asset-purchaseYear"
              name="purchaseYear"
              type="number"
              min="1970"
              max={currentYear + 1}
              step="1"
              defaultValue={currentYear}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="asset-purchasePrice">Purchase price</Label>
            <Input
              id="asset-purchasePrice"
              name="purchasePrice"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="asset-currentWorth">Worth now</Label>
            <Input
              id="asset-currentWorth"
              name="currentWorth"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="asset-worthYear">Worth year</Label>
            <Input
              id="asset-worthYear"
              name="worthYear"
              type="number"
              min="1970"
              max={currentYear + 1}
              step="1"
              defaultValue={currentYear}
              required
            />
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="asset-notes">Notes (optional)</Label>
            <Input
              id="asset-notes"
              name="notes"
              placeholder="Condition, serial, location…"
            />
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Add asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
