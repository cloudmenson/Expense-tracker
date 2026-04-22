"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCountUp } from "@/components/ui/count-up";
import { formatMoney } from "@/lib/utils";

interface StatCardProps {
  label: string;
  labelColor?: string;
  value: string;
  numericValue?: number;
  currency?: string;
  sub?: string;
  icon?: LucideIcon;
  color?: string;
  trend?: number;
  animateValue?: boolean;
  avatarImage?: string;
  avatarColor?: string;
  avatarName?: string;
}

export function StatCard({
  label,
  labelColor,
  value,
  numericValue,
  currency,
  sub,
  icon: Icon,
  color = "emerald",
  trend,
  animateValue = true,
  avatarImage,
  avatarColor,
  avatarName,
}: StatCardProps) {
  const animated = useCountUp({ target: numericValue ?? 0, duration: 1200 });
  const numericDisplay = animateValue ? animated : (numericValue ?? 0);
  const displayValue =
    numericValue !== undefined && currency
      ? formatMoney(numericDisplay, currency)
      : value;

  void color;

  return (
    <div className="glass-card group rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: labelColor ?? "var(--foreground)", opacity: 0.5 }}
          >
            {label}
          </p>
          <p className="text-2xl font-black tracking-tight sm:text-[1.8rem]">
            {displayValue}
          </p>
          {sub && <p className="text-xs text-foreground/45">{sub}</p>}
        </div>
        {avatarImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarImage}
            alt={avatarName ?? label}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-foreground/10"
          />
        ) : avatarColor ? (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ring-1 ring-foreground/10"
            style={{ backgroundColor: avatarColor }}
          >
            {avatarName?.trim().charAt(0).toUpperCase() ?? "?"}
          </div>
        ) : Icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/6 ring-1 ring-foreground/8 text-foreground/50">
            <Icon className="h-4.5 w-4.5" />
          </div>
        ) : null}
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          <div className="flex items-center gap-1 rounded-lg bg-foreground/6 px-2 py-1 text-[11px] font-semibold text-foreground/50">
            {trend >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
          <span className="text-[11px] text-foreground/32">
            vs прошлий місяць
          </span>
        </div>
      )}
    </div>
  );
}
