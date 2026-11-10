"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import {
  createDebtPayment,
  type PaymentActionState,
} from "@/app/actions/payments";
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
import { formatCurrency } from "@/lib/debts";
import type { Debt } from "@/lib/generated/prisma/client";

const initialState: PaymentActionState = {};

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-white/40 px-2.5 py-1 text-base outline-none transition-colors backdrop-blur-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function PaymentFormDialog({ debts }: { debts: Debt[] }) {
  const now = useMemo(() => new Date(), []);
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [debtId, setDebtId] = useState(debts[0]?.id ?? "");
  const [state, formAction, pending] = useActionState(
    createDebtPayment,
    initialState
  );

  useActionToast(state, pending, { successMessage: "Payment logged" });

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      setFormKey((key) => key + 1);
    }
  }, [state.success]);

  useEffect(() => {
    if (!debtId && debts[0]?.id) {
      setDebtId(debts[0].id);
    }
  }, [debtId, debts]);

  const selectedDebt = debts.find((debt) => debt.id === debtId) ?? debts[0];

  if (debts.length === 0) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setFormKey((key) => key + 1);
        }
      }}
    >
      <DialogTrigger render={<Button type="button" />}>
        <PlusIcon data-icon="inline-start" />
        Log payment
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log monthly payment</DialogTitle>
          <DialogDescription>
            Key in the date and amount you paid. Paying more than the
            installment usually means fee, penalty, or late interest.
          </DialogDescription>
        </DialogHeader>
        <form
          key={formKey}
          action={formAction}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="payment-debt">Debt</Label>
            <select
              id="payment-debt"
              name="debtId"
              required
              value={debtId}
              onChange={(event) => setDebtId(event.currentTarget.value)}
              className={selectClassName}
            >
              {debts.map((debt) => (
                <option key={debt.id} value={debt.id}>
                  {debt.name} · {formatCurrency(debt.monthlyPayment)} / month
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payment-period-month">For month</Label>
            <select
              id="payment-period-month"
              name="periodMonth"
              required
              defaultValue={now.getMonth() + 1}
              className={selectClassName}
            >
              {Array.from({ length: 12 }, (_, index) => {
                const month = index + 1;
                const label = new Intl.DateTimeFormat("en-MY", {
                  month: "long",
                }).format(new Date(2000, index, 1));
                return (
                  <option key={month} value={month}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payment-period-year">Year</Label>
            <Input
              id="payment-period-year"
              name="periodYear"
              type="number"
              min={2000}
              max={2100}
              required
              defaultValue={now.getFullYear()}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payment-paid-at">Date paid</Label>
            <Input
              id="payment-paid-at"
              name="paidAt"
              type="date"
              required
              defaultValue={toDateInputValue(now)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payment-amount">Amount paid (RM)</Label>
            <Input
              key={selectedDebt?.id}
              id="payment-amount"
              name="amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              required
              defaultValue={selectedDebt?.monthlyPayment ?? ""}
            />
            {selectedDebt ? (
              <p className="text-xs text-muted-foreground">
                Expected installment {formatCurrency(selectedDebt.monthlyPayment)}
                . Due day {selectedDebt.paymentDueDay}.
              </p>
            ) : null}
          </div>

          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="payment-notes">Notes (optional)</Label>
            <Input
              id="payment-notes"
              name="notes"
              placeholder="Late fee, penalty, extra interest…"
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
              {pending ? "Saving…" : "Save payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
