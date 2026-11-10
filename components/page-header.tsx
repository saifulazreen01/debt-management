import type { ReactNode } from "react";
import { GuideAvatar } from "@/components/journey/guide-character";
import {
  getPageCompanion,
  type JourneyCharacter,
} from "@/lib/journey-characters";

export function PageHeader({
  title,
  description,
  actions,
  companion,
  page,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  companion?: JourneyCharacter;
  page?: "dashboard" | "debts" | "incomes" | "investments" | "assets";
}) {
  const guide = companion ?? (page ? getPageCompanion(page) : null);

  return (
    <div className="glass-panel flex flex-col gap-3 rounded-2xl px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-start gap-3">
        {guide ? <GuideAvatar character={guide} mood="calm" size="md" /> : null}
        <div className="grid gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          {guide ? (
            <p className="text-xs text-primary">
              Guided by {guide.name} · {guide.role}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
