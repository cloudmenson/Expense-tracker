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
  Home,
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
    href: "/rental",
    label: "Оренда",
    mobileLabel: "Оренда",
    icon: Home,
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
                className={`group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-colors duration-150 focus:outline-none focus-visible:outline-none ${
                  active
                    ? "glass-pill text-foreground"
                    : "text-foreground/42 hover:text-foreground/80"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 shrink-0 transition-colors ${active ? "text-foreground/80" : "text-foreground/30 group-hover:text-foreground/60"}`}
                  strokeWidth={active ? 2 : 1.75}
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
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HeartLogo wrapperClass="h-8 w-8 rounded-xl" svgSize={18} />
            <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-foreground/65">
              Budget for Two
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Content ── */}
      <main
        className="mobile-scrollbar-hidden flex-1 pt-[calc(84px+max(12px,env(safe-area-inset-top)))] pb-[calc(112px+env(safe-area-inset-bottom))] lg:pl-[calc(17rem+2rem)] lg:pt-0 lg:pb-0"
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
      <nav className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+14px)] z-40 flex justify-center px-6 lg:hidden">
        <div className="nav-island relative flex h-[72px] items-center gap-2 rounded-[36px] px-3">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex h-13 w-13 touch-manipulation select-none items-center justify-center rounded-[24px] outline-none transition-colors duration-200 focus:outline-none focus-visible:outline-none active:scale-95 ${
                  active ? "nav-active-item" : ""
                }`}
              >
                <item.icon
                  className={`h-[22px] w-[22px] transition-colors ${
                    active
                      ? "text-foreground dark:text-white"
                      : "text-foreground/65 group-hover:text-foreground dark:text-white/55 dark:group-hover:text-white/80"
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
