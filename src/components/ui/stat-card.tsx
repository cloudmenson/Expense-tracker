"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  color?: string;
  trend?: number;
  animateValue?: boolean;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "emerald",
  trend,
  animateValue = true,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!animateValue || !hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    setDisplayValue(value);
  }, [value, animateValue]);
  const colorClasses: Record<string, string> = {
    emerald:
      "from-emerald-500/25 via-emerald-500/15 to-lime-500/15 text-emerald-600 dark:text-emerald-300",
    rose: "from-rose-500/25 via-rose-500/15 to-pink-500/15 text-rose-600 dark:text-rose-300",
    violet:
      "from-violet-500/25 via-violet-500/15 to-purple-500/15 text-violet-600 dark:text-violet-300",
    sky: "from-sky-500/25 via-sky-500/15 to-cyan-500/15 text-sky-600 dark:text-sky-300",
    amber:
      "from-amber-500/25 via-amber-500/15 to-yellow-500/15 text-amber-600 dark:text-amber-300",
  };
  const iconBg = colorClasses[color] || colorClasses.emerald;

  return (
    <div className="glass-card group rounded-2xl p-5 transition-all hover:scale-[1.02] hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
            {label}
          </p>
          <p className="animate-count-up text-2xl font-bold tracking-tight">
            {displayValue}
          </p>
          {sub && <p className="text-xs text-foreground/50">{sub}</p>}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${iconBg}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          <div
            className={`flex items-center gap-1 rounded-lg px-2 py-1 ${
              trend >= 0
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-300"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
          <span className="text-foreground/40">vs прошлий місяц</span>
        </div>
      )}
    </div>
  );
}
