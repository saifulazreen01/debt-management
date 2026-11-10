import type { ReactNode } from "react";
import { cn } from "cn";

export function PageFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8",
        className
      )}
    >
      {children}
    </div>
  );
}
