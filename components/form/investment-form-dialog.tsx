"use client";

import { useActionState, useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import {
  createInvestment,
  type InvestmentActionState,
} from "@/app/actions/investments";
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
  INVESTMENT_CATEGORIES,
  INVESTMENT_CATEGORY_LABELS,
} from "@/lib/investment-categories";
import type { InvestmentContributionType } from "@/lib/generated/prisma/enums";
import { cn } from "cn";

const initialState: InvestmentActionState = {};

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-white/40 px-2.5 py-1 text-base outline-none transition-colors backdrop-blur-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30";

export function InvestmentFormDialog() {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [contributionType, setContributionType] =
    useState<InvestmentContributionType>("NONE");
  const [state, formAction, pending] = useActionState(
    createInvestment,
    initialState
  );

  useActionToast(state, pending, { successMessage: "Investment added" });

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      setFormKey((key) => key + 1);
      setContributionType("NONE");
    }
  }, [state.success]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setFormKey((key) => key + 1);
          setContributionType("NONE");
        }
      }}
    >
      <DialogTrigger render={<Button type="button" />}>
        <PlusIcon data-icon="inline-start" />
        Add investment
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add investment</DialogTitle>
          <DialogDescription>
            Track balance now, plus optional monthly top-up as a fixed amount or
            percent of income.
          </DialogDescription>
        </DialogHeader>
        <form
          key={formKey}
          action={formAction}
          className="grid gap-4 sm:grid-cols-2"
        >
          <input type="hidden" name="contributionType" value={contributionType} />

          <div className="grid gap-2">
            <Label htmlFor="investment-name">Name</Label>
            <Input
              id="investment-name"
              name="name"
              placeholder="ASB Account 1, Maybank FD…"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="investment-category">Category</Label>
            <select
              id="investment-category"
              name="category"
              required
              defaultValue=""
              className={selectClassName}
            >
              <option value="" disabled>
                Select category
              </option>
              {INVESTMENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {INVESTMENT_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="investment-amount">Current amount</Label>
            <Input
              id="investment-amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-medium">Monthly contribution</p>
            <div className="inline-flex rounded-xl border border-white/40 bg-white/25 p-1 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              {(
                [
                  ["NONE", "None"],
                  ["FIXED", "Fixed amount"],
                  ["PERCENTAGE", "% of income"],
                ] as const
              ).map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={contributionType === value ? "default" : "ghost"}
                  className={cn(
                    contributionType === value ? "" : "text-muted-foreground"
                  )}
                  onClick={() => setContributionType(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {contributionType !== "NONE" ? (
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="investment-contributionValue">
                {contributionType === "FIXED"
                  ? "Monthly fixed amount"
                  : "Monthly percent of income"}
              </Label>
              <Input
                id="investment-contributionValue"
                name="contributionValue"
                type="number"
                min="0.01"
                max={contributionType === "PERCENTAGE" ? 100 : undefined}
                step="0.01"
                placeholder={
                  contributionType === "FIXED" ? "e.g. 500.00" : "e.g. 10"
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                {contributionType === "FIXED"
                  ? "Same RM amount invested every month."
                  : "Percentage of active monthly income contributed every month."}
              </p>
            </div>
          ) : (
            <input type="hidden" name="contributionValue" value="" />
          )}

          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Add investment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
