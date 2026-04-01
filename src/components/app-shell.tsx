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

const navItems = [
  { href: "/", label: "Огляд", icon: LayoutDashboard },
  { href: "/expenses", label: "Витрати", icon: Receipt },
  { href: "/categories", label: "Категорії", icon: FolderOpen },
  { href: "/analytics", label: "Аналітика", icon: BarChart3 },
  { href: "/settings", label: "Налаштування", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-white/10 bg-surface/60 backdrop-blur-2xl lg:flex dark:border-white/5">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-lime-400 text-lg shadow-lg shadow-emerald-500/25">
            💚
          </div>
          <span className="text-sm font-bold tracking-wide">
            Budget&nbsp;for&nbsp;Two
          </span>
        </div>

        {/* Nav */}
        <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => {
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

        {/* Bottom */}
        <div className="border-t border-white/10 p-4 dark:border-white/5">
          <ThemeToggle />
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <header className="sticky top-0 z-30 flex h-[calc(56px+env(safe-area-inset-top))] items-end border-b border-white/10 bg-surface/70 px-4 pb-2 backdrop-blur-2xl lg:hidden dark:border-white/5">
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
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain lg:pl-[260px]">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[calc(60px+env(safe-area-inset-bottom))] items-start justify-around border-t border-white/10 bg-surface/70 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-2xl lg:hidden dark:border-white/5">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-semibold touch-manipulation select-none transition-all ${
                active ? "text-emerald-500" : "text-foreground/35"
              }`}
            >
              <div
                className={`flex items-center justify-center rounded-xl px-4 py-1 transition-all ${
                  active
                    ? "bg-emerald-500/15 shadow-sm shadow-emerald-500/10"
                    : ""
                }`}
              >
                <item.icon
                  className={`h-5 w-5 transition-all ${active ? "scale-110" : ""}`}
                />
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Space for bottom nav on mobile */}
      <div className="h-[calc(60px+env(safe-area-inset-bottom))] shrink-0 lg:hidden" />
    </div>
  );
}
