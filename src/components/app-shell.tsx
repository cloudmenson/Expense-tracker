"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  FolderOpen,
  BarChart3,
  Settings,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Огляд", mobileLabel: "Огляд", icon: LayoutDashboard },
  { href: "/expenses", label: "Витрати", mobileLabel: "Витрати", icon: Receipt },
  { href: "/categories", label: "Категорії", mobileLabel: "Категорії", icon: FolderOpen },
  { href: "/analytics", label: "Аналітика", mobileLabel: "Аналітика", icon: BarChart3 },
  { href: "/settings", label: "Налаштування", mobileLabel: "Налашт.", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-white/10 bg-surface/60 backdrop-blur-2xl lg:flex dark:border-white/5">
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-lime-400 text-lg shadow-lg shadow-emerald-500/25">
            💚
          </div>
          <span className="text-sm font-bold tracking-wide">
            Budget&nbsp;for&nbsp;Two
          </span>
        </div>
        <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-linear-to-r from-emerald-500/15 to-lime-500/10 text-emerald-600 dark:text-emerald-400"
                    : "text-foreground/60 hover:bg-white/60 hover:text-foreground dark:hover:bg-white/5"
                }`}
              >
                <item.icon
                  className={`h-[18px] w-[18px] transition-colors ${active ? "text-emerald-500" : "text-foreground/40 group-hover:text-foreground/60"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4 dark:border-white/5">
          <ThemeToggle />
        </div>
      </aside>

      {/* ── Mobile header (fixed) ── */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-end border-b border-white/10 bg-surface/80 px-4 pb-2.5 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-2xl lg:hidden dark:border-white/5">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-400 to-lime-400 text-base">
              💚
            </div>
            <span className="text-sm font-bold tracking-tight">
              Budget for Two
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 pt-[calc(52px+max(12px,env(safe-area-inset-top)))] pb-[calc(56px+env(safe-area-inset-bottom))] lg:pl-[260px] lg:pt-0 lg:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom nav (fixed) ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-surface/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden dark:border-white/5">
        <div className="mx-auto flex h-14 max-w-lg items-stretch">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-1 touch-manipulation select-none flex-col items-center justify-center gap-0.5 active:opacity-70"
              >
                {/* Active pill */}
                {active && (
                  <span className="absolute inset-x-2 top-0 h-[3px] rounded-b-full bg-emerald-500" />
                )}
                <item.icon
                  className={`h-[22px] w-[22px] ${
                    active
                      ? "text-emerald-500"
                      : "text-foreground/35"
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold leading-none ${
                    active ? "text-emerald-500" : "text-foreground/35"
                  }`}
                >
                  {item.mobileLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
