"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider className="relative isolate overflow-hidden bg-transparent">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="ambient-orb top-[-8%] left-[-6%] size-[28rem] bg-[color-mix(in_oklch,var(--primary)_45%,transparent)]" />
          <div className="ambient-orb top-[12%] right-[-8%] size-[24rem] bg-[color-mix(in_oklch,oklch(0.78_0.08_155)_40%,transparent)]" />
          <div className="ambient-orb bottom-[-10%] left-[35%] size-[26rem] bg-[color-mix(in_oklch,oklch(0.78_0.1_75)_28%,transparent)]" />
        </div>

        <AppSidebar />

        <SidebarInset className="relative m-0 min-h-svh overflow-hidden bg-transparent md:m-3 md:ml-0 md:min-h-[calc(100svh-1.5rem)] md:rounded-3xl md:shadow-none md:ring-1 md:ring-white/35 md:backdrop-blur-[2px] md:peer-data-[state=collapsed]:ml-3 dark:md:ring-white/10">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-white/25 via-transparent to-primary/5 dark:from-white/5" />

          <header className="glass-header sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 px-4 md:rounded-t-3xl">
            <SidebarTrigger className="rounded-xl bg-white/30 hover:bg-white/45 dark:bg-white/10 dark:hover:bg-white/15" />
            <Separator orientation="vertical" className="h-4 bg-foreground/15" />
            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-semibold tracking-tight">
                Finance workspace
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Debt clarity · cashflow · investments
              </p>
            </div>
          </header>

          <div className="relative flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
