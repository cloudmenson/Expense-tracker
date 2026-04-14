"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, Receipt, Settings, Cat } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeartLogo } from "@/components/heart-logo";

const NAV_ITEMS = [
  { href: "/", label: "Огляд", mobileLabel: "Огляд", icon: LayoutDashboard },
  {
    href: "/expenses",
    label: "Витрати",
    mobileLabel: "Витрати",
    icon: Receipt,
  },
  {
    href: "/settings",
    label: "Налаштування",
    mobileLabel: "Налашт.",
    icon: Settings,
  },
  {
    href: "/trash",
    label: "Кошик",
    mobileLabel: "Кошик",
    icon: Cat,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only horizontal swipes (more horizontal than vertical, min 60px)
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.8) return;
    const hrefs = NAV_ITEMS.map((i) => i.href);
    const current = hrefs.findIndex((h) =>
      h === "/" ? pathname === "/" : pathname.startsWith(h),
    );
    if (dx < 0 && current < hrefs.length - 1) {
      setSwipeDirection("left");
      setIsNavigating(true);
      router.push(hrefs[current + 1]);
    }

    if (dx > 0 && current > 0) {
      setSwipeDirection("right");
      setIsNavigating(true);
      router.push(hrefs[current - 1]);
    }
  };

  useEffect(() => {
    if (!isNavigating) return;
    const t = window.setTimeout(() => {
      setIsNavigating(false);
      setSwipeDirection(null);
    }, 220);
    return () => window.clearTimeout(t);
  }, [pathname, isNavigating]);

  if (pathname === "/unlock") {
    return <>{children}</>;
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-65 flex-col border-r border-white/10 bg-surface/60 backdrop-blur-2xl lg:flex dark:border-white/5">
        <div className="flex h-16 items-center gap-3 px-6">
          <HeartLogo wrapperClass="h-9 w-9 rounded-xl" svgSize={20} />
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
                    ? "bg-linear-to-r from-rose-500/15 to-pink-500/10 text-rose-600 dark:text-pink-400"
                    : "text-foreground/60 hover:bg-white/60 hover:text-foreground dark:hover:bg-white/5"
                }`}
              >
                <item.icon
                  className={`h-4.5 w-4.5 transition-colors ${active ? "text-rose-600 dark:text-pink-400" : "text-foreground/40 group-hover:text-foreground/60"}`}
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
            <HeartLogo wrapperClass="h-8 w-8 rounded-lg" svgSize={18} />
            <span className="text-sm font-bold tracking-tight">
              Budget for Two
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Content ── */}
      <main
        className="flex-1 pt-[calc(52px+max(12px,env(safe-area-inset-top)))] pb-[calc(86px+env(safe-area-inset-bottom))] lg:pl-65 lg:pt-0 lg:pb-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`mx-auto max-w-6xl px-4 py-5 transition-all duration-220 ease-out sm:px-6 lg:px-8 lg:py-8 ${
            isNavigating
              ? swipeDirection === "left"
                ? "-translate-x-2 opacity-85"
                : "translate-x-2 opacity-85"
              : "translate-x-0 opacity-100"
          }`}
        >
          {children}
        </div>
      </main>

      {/* ── Mobile bottom nav (island) ── */}
      <nav className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+8px)] z-40 px-3 lg:hidden">
        <div className="mx-auto flex h-14 w-full max-w-sm items-stretch rounded-2xl border border-white/15 bg-surface/88 shadow-[0_12px_30px_rgba(0,0,0,0.24)] backdrop-blur-2xl dark:border-white/10">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-1 touch-manipulation select-none items-center justify-center active:opacity-70"
              >
                {/* Active pill */}
                {active && (
                  <span className="absolute inset-x-3 top-1.5 h-1 rounded-full bg-linear-[135deg,#e11d48_0%,#f472b6_100%]" />
                )}
                <item.icon
                  className={`h-6 w-6 ${
                    active
                      ? "text-rose-600 dark:text-pink-400"
                      : "text-foreground/35"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
