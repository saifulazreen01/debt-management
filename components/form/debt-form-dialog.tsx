"use client";

import { useActionState, useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { createDebt, type DebtActionState } from "@/app/actions/debts";
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

const initialState: DebtActionState = {};

export function DebtFormDialog({
  defaultOpen = false,
}: {
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(createDebt, initialState);

  useActionToast(state, pending, { successMessage: "Debt added" });

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
        if (!nextOpen) {
          setFormKey((key) => key + 1);
        }
      }}
    >
      <DialogTrigger render={<Button type="button" />}>
        <PlusIcon data-icon="inline-start" />
        Add debt
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add debt</DialogTitle>
          <DialogDescription>
            Simple: loan + monthly payment. Advanced: rate and fees to calculate
            installment, interest, and total cost.
          </DialogDescription>
        </DialogHeader>
        <form
          key={formKey}
          action={formAction}
          className="grid gap-4 sm:grid-cols-2"
        >
          <DebtFields idPrefix="create-debt-" />
          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Add debt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
