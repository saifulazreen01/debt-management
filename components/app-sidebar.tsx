"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalculatorIcon,
  LayoutDashboardIcon,
  PackageIcon,
  PiggyBankIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Incomes",
    href: "/incomes",
    icon: WalletIcon,
  },
  {
    title: "Investments",
    href: "/investments",
    icon: TrendingUpIcon,
  },
  {
    title: "Assets",
    href: "/assets",
    icon: PackageIcon,
  },
  {
    title: "Debts",
    href: "/debts",
    icon: PiggyBankIcon,
  },
  {
    title: "Calculator",
    href: "/calculator",
    icon: CalculatorIcon,
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="border-b border-sidebar-border/70 px-3 py-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/90 text-sm font-semibold text-sidebar-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
            SF
          </div>
          <div className="grid min-w-0 gap-0.5 group-data-[collapsible=icon]:hidden">
            <p className="truncate font-heading text-sm font-semibold tracking-tight text-white">
              Saiful Finance
            </p>
            <p className="truncate text-xs text-white/70">Personal ledger</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/65">
            Navigate
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      className="text-white/85 hover:bg-white/15 hover:text-white data-active:bg-white/20 data-active:font-semibold data-active:text-white data-active:shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] [&>svg]:text-white/80 data-active:[&>svg]:text-white"
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 px-3 py-3 group-data-[collapsible=icon]:hidden">
        <p className="text-xs leading-relaxed text-white/65">
          Know what to pay this month and when debt settles.
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
