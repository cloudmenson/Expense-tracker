"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Receipt,
  Settings,
  Cat,
  UsersRound,
} from "lucide-react";
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
    href: "/profiles",
    label: "Профілі",
    mobileLabel: "Профілі",
    icon: UsersRound,
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
  const swipeAxis = useRef<"x" | "y" | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swipeAxis.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;

    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (!swipeAxis.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      swipeAxis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }

    if (swipeAxis.current === "x" && Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    swipeAxis.current = null;
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

  const handleTouchCancel = () => {
    swipeAxis.current = null;
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
      <aside className="glass-panel fixed inset-y-4 left-4 z-30 hidden w-[17rem] flex-col rounded-xl p-3 lg:flex">
        <div className="flex h-16 items-center gap-3 px-4">
          <HeartLogo wrapperClass="h-9 w-9 rounded-xl" svgSize={20} />
          <span className="text-sm font-bold tracking-[0.24em] uppercase text-foreground/80">
            Budget&nbsp;for&nbsp;Two
          </span>
        </div>
        <nav className="mt-3 flex flex-1 flex-col gap-2 px-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? "glass-pill text-foreground shadow-[0_18px_34px_rgba(239,91,143,0.16)]"
                    : "text-foreground/62 hover:bg-white/10 hover:text-foreground dark:hover:bg-white/6"
                }`}
              >
                <item.icon
                  className={`h-4.5 w-4.5 transition-colors ${active ? "text-rose-500 dark:text-pink-300" : "text-foreground/38 group-hover:text-foreground/72"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mx-2 mt-2 border-t border-transparent pt-2">
          <ThemeToggle />
        </div>
      </aside>

      {/* ── Mobile header (fixed) ── */}
      <header className="glass-panel fixed inset-x-3 top-[max(10px,env(safe-area-inset-top))] z-40 flex items-center rounded-xl px-4 py-3 lg:hidden">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HeartLogo wrapperClass="h-8 w-8 rounded-lg" svgSize={18} />
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-foreground/80">
              Budget for Two
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Content ── */}
      <main
        className="mobile-scrollbar-hidden flex-1 pt-[calc(84px+max(12px,env(safe-area-inset-top)))] pb-[calc(94px+env(safe-area-inset-bottom))] lg:pl-[calc(17rem+2rem)] lg:pt-0 lg:pb-0"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        style={{ touchAction: "pan-y" }}
      >
        <div
          className={`mx-auto max-w-6xl px-4 py-5 transition-all duration-220 ease-out sm:px-5 lg:px-8 lg:py-8 ${
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
      <nav className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+10px)] z-40 px-3 lg:hidden">
        <div className="glass-panel mx-auto flex h-16 w-full max-w-sm items-stretch rounded-xl px-1.5">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex flex-1 touch-manipulation select-none items-center justify-center rounded-xl transition-all active:opacity-70 ${
                  active ? "glass-pill" : ""
                }`}
              >
                {active && (
                  <span className="absolute inset-x-5 top-1.5 h-1 rounded-xl bg-linear-[135deg,var(--brand)_0%,var(--brand-strong)_100%]" />
                )}
                <item.icon
                  className={`h-6 w-6 ${
                    active
                      ? "text-rose-500 dark:text-pink-300"
                      : "text-foreground/35 group-hover:text-foreground/65"
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
