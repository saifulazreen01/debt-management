"use client";

import { useActionState, useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { createIncome, type IncomeActionState } from "@/app/actions/income";
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
  INCOME_CATEGORIES,
  INCOME_CATEGORY_LABELS,
} from "@/lib/income-categories";
import type { IncomeCategory } from "@/lib/generated/prisma/enums";

const initialState: IncomeActionState = {};

export function IncomeFormDialog({
  defaultOpen = false,
  needsSetup = false,
}: {
  defaultOpen?: boolean;
  needsSetup?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [state, formAction, pending] = useActionState(createIncome, initialState);
  const [category, setCategory] = useState<IncomeCategory | "">("");

  useActionToast(state, pending, { successMessage: "Income added" });

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      setCategory("");
    }
  }, [state.success]);

  const isLeasing = category === "LEASING";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setCategory("");
        }
      }}
    >
      <DialogTrigger render={<Button type="button" />}>
        <PlusIcon data-icon="inline-start" />
        {needsSetup ? "Key in income" : "Add income"}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {needsSetup ? "Key in your income info" : "Add income"}
          </DialogTitle>
          <DialogDescription>
            {needsSetup
              ? "Add salary, other income, or leasing entries by category."
              : "Multiple income entries with category for clearer tracking."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="income-name">Name</Label>
            <Input
              id="income-name"
              name="name"
              placeholder="Main job, side hustle, shop lot…"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="income-category">Category</Label>
            <select
              id="income-category"
              name="category"
              required
              value={category}
              onChange={(event) =>
                setCategory(event.currentTarget.value as IncomeCategory | "")
              }
              className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30"
            >
              <option value="" disabled>
                Select category
              </option>
              {INCOME_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {INCOME_CATEGORY_LABELS[item]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="income-monthlyAmount">Monthly amount</Label>
            <Input
              id="income-monthlyAmount"
              name="monthlyAmount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="income-startDate">
              Start from {isLeasing ? "" : "(optional)"}
            </Label>
            <Input
              id="income-startDate"
              name="startDate"
              type="date"
              required={isLeasing}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="income-endDate">
              End date {isLeasing ? "" : "(optional)"}
            </Label>
            <Input
              id="income-endDate"
              name="endDate"
              type="date"
              required={isLeasing}
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
              {pending ? "Saving…" : "Add income"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
