"use client";

import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  color?: string;
  trend?: number;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "emerald",
  trend,
}: StatCardProps) {
  const colorClasses: Record<string, string> = {
    emerald:
      "from-emerald-500/20 to-lime-500/10 text-emerald-600 dark:text-emerald-400",
    rose: "from-rose-500/20 to-pink-500/10 text-rose-600 dark:text-rose-400",
    violet:
      "from-violet-500/20 to-purple-500/10 text-violet-600 dark:text-violet-400",
    sky: "from-sky-500/20 to-cyan-500/10 text-sky-600 dark:text-sky-400",
    amber:
      "from-amber-500/20 to-yellow-500/10 text-amber-600 dark:text-amber-400",
  };
  const iconBg = colorClasses[color] || colorClasses.emerald;

  return (
    <div className="glass-card group rounded-2xl p-5 transition-all hover:scale-[1.02] hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {sub && <p className="text-xs text-foreground/50">{sub}</p>}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${iconBg}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium">
          <span className={trend >= 0 ? "text-emerald-500" : "text-rose-500"}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(0)}%
          </span>
          <span className="text-foreground/40">vs прошлый месяц</span>
        </div>
      )}
    </div>
  );
}
