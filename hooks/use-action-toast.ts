"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type ActionFeedback = {
  error?: string;
  success?: boolean;
};

export function useActionToast(
  state: ActionFeedback,
  pending: boolean,
  options?: {
    successMessage?: string;
  }
) {
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      if (state.error) {
        toast.error(state.error, {
          position: "bottom-right",
          duration: 3200,
        });
      } else if (state.success) {
        toast.success(options?.successMessage ?? "Saved", {
          position: "bottom-right",
          duration: 2200,
        });
      }
    }

    wasPending.current = pending;
  }, [pending, state.error, state.success, options?.successMessage]);
}
