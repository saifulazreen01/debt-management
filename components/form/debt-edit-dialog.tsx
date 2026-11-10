"use client";

import { useActionState, useEffect, useState } from "react";
import { updateDebt, type DebtActionState } from "@/app/actions/debts";
import { DebtFields } from "@/components/form/debt-fields";
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
import { useActionToast } from "@/hooks/use-action-toast";
import type { Debt } from "@/lib/generated/prisma/client";

const initialState: DebtActionState = {};

export function DebtEditDialog({ debt }: { debt: Debt }) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const updateDebtWithId = updateDebt.bind(null, debt.id);
  const [state, formAction, pending] = useActionState(
    updateDebtWithId,
    initialState
  );

  useActionToast(state, pending, { successMessage: "Debt updated" });

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
        if (nextOpen) {
          setFormKey((key) => key + 1);
        }
      }}
    >
      <DialogTrigger render={<Button type="button" variant="ghost" size="sm" />}>
        Edit
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit debt</DialogTitle>
          <DialogDescription>
            Update using simple payment entry or advanced rate and fee
            calculation.
          </DialogDescription>
        </DialogHeader>
        <form
          key={`${debt.id}-${formKey}`}
          action={formAction}
          className="grid gap-4 sm:grid-cols-2"
        >
          <DebtFields debt={debt} idPrefix={`edit-${debt.id}-`} />
          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
