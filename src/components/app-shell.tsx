"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Settings,
  Home,
  ShoppingBag,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeartLogo } from "@/components/heart-logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Огляд", mobileLabel: "Огляд", icon: LayoutDashboard },
  {
    href: "/expenses",
    label: "Витрати",
    mobileLabel: "Витрати",
    icon: Receipt,
  },
  {
    href: "/rental",
    label: "Оренда",
    mobileLabel: "Оренда",
    icon: Home,
  },
  {
    href: "/wishlist",
    label: "Хочу купити",
    mobileLabel: "Хочу",
    icon: ShoppingBag,
  },
  {
    href: "/settings",
    label: "Налаштування",
    mobileLabel: "Налашт.",
    icon: Settings,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/unlock") {
    return <>{children}</>;
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="glass-panel fixed inset-y-4 left-4 z-30 hidden w-[17rem] flex-col rounded-2xl p-3 lg:flex">
        <div className="flex h-16 items-center gap-3 px-4">
          <HeartLogo wrapperClass="h-9 w-9 rounded-xl" svgSize={20} />
          <span className="text-xs font-bold tracking-[0.22em] uppercase text-foreground/70">
            Budget&nbsp;for&nbsp;Two
          </span>
        </div>
        <nav className="mt-3 flex flex-1 flex-col gap-1.5 px-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={
                  active
                    ? {
                        background: "var(--foreground)",
                        color: "var(--foreground-on-active)",
                      }
                    : undefined
                }
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-colors",
                  active
                    ? "shadow-sm"
                    : "text-foreground/70 hover:bg-foreground/8 hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                    !active && "text-foreground/70 group-hover:text-foreground",
                  )}
                  strokeWidth={active ? 2.25 : 1.9}
                />
                <span className={active ? "font-semibold" : ""}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="mx-2 mt-2 border-t border-transparent pt-2">
          <ThemeToggle />
        </div>
      </aside>

      {/* ── Mobile header (fixed) ── */}
      <header className="glass-panel fixed inset-x-3 top-[max(10px,env(safe-area-inset-top))] z-40 flex items-center rounded-2xl px-4 py-3 lg:hidden">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <HeartLogo wrapperClass="h-8 w-8 rounded-xl" svgSize={18} />
            <span className="truncate text-[10px] font-bold uppercase tracking-[0.26em] text-foreground/65">
              Budget for Two
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />
            <Link
              href="/settings"
              aria-label="Налаштування"
              style={
                pathname.startsWith("/settings")
                  ? {
                      background: "var(--foreground)",
                      color: "var(--foreground-on-active)",
                    }
                  : undefined
              }
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl outline-none transition-all active:scale-95",
                !pathname.startsWith("/settings") &&
                  "glass-pill text-foreground/70 hover:text-foreground",
              )}
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main
        className="mobile-scrollbar-hidden flex-1 pt-[calc(84px+max(10px,env(safe-area-inset-top)))] pb-[calc(108px+env(safe-area-inset-bottom))] lg:pt-0 lg:pb-0 lg:pl-76"
        style={{ touchAction: "pan-y" }}
      >
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom nav (island) ── */}
      <nav className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-40 flex justify-center px-3 lg:hidden">
        <div className="nav-island relative flex h-19 max-w-full items-center gap-2 rounded-[40px] px-3 sm:gap-3 sm:px-4">
          {NAV_ITEMS.filter((i) => i.href !== "/settings").map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={
                  active
                    ? {
                        background: "var(--foreground)",
                        color: "var(--foreground-on-active)",
                      }
                    : undefined
                }
                className="group relative flex h-14 w-14 shrink-0 touch-manipulation select-none items-center justify-center rounded-2xl outline-none active:scale-95 sm:h-15 sm:w-15 sm:rounded-[28px]"
              >
                <item.icon
                  className={`h-6 w-6 ${
                    active ? "" : "text-foreground/80 group-hover:text-foreground"
                  }`}
                  strokeWidth={active ? 2.25 : 2}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
