"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Activity } from "lucide-react";
import {
  addDays,
  format,
  parseISO,
  startOfWeek,
  subDays,
} from "date-fns";
import { uk } from "date-fns/locale";
import { cn, formatMoney } from "@/lib/utils";
import type { Expense } from "@/types/expense";

interface SpendingHeatmapProps {
  expenses: Expense[];
  currency: string;
  /** Number of weeks back to show. Default 52 (one year, GitHub-style). */
  weeks?: number;
}

interface Cell {
  date: Date;
  iso: string;
  amount: number;
}

const INTENSITY_OPACITIES = [0, 22, 42, 65, 100] as const;

function intensityStyle(level: number): CSSProperties {
  if (level === 0) {
    return {
      backgroundColor: "color-mix(in srgb, var(--foreground) 5%, transparent)",
    };
  }
  return {
    backgroundColor: `color-mix(in srgb, var(--brand) ${INTENSITY_OPACITIES[level]}%, transparent)`,
  };
}

function bucket(amount: number, max: number): number {
  if (amount === 0 || max === 0) return 0;
  const ratio = amount / max;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5) return 2;
  if (ratio < 0.75) return 3;
  return 4;
}

export function SpendingHeatmap({
  expenses,
  currency,
  weeks = 52,
}: SpendingHeatmapProps) {
  const [hovered, setHovered] = useState<Cell | null>(null);

  // Daily totals
  const totals = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of expenses) {
      m.set(e.date, (m.get(e.date) ?? 0) + e.amount);
    }
    return m;
  }, [expenses]);

  // Today, plus the Monday of the earliest week shown
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const firstWeekStart = useMemo(
    () =>
      startOfWeek(subDays(today, weeks * 7 - 1), {
        weekStartsOn: 1,
      }),
    [today, weeks],
  );

  // Build a `weeks × 7` matrix (columns = weeks, rows = Mon..Sun)
  const grid: Cell[][] = useMemo(() => {
    const out: Cell[][] = [];
    for (let w = 0; w < weeks; w++) {
      const col: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(firstWeekStart, w * 7 + d);
        const iso = format(date, "yyyy-MM-dd");
        col.push({ date, iso, amount: totals.get(iso) ?? 0 });
      }
      out.push(col);
    }
    return out;
  }, [firstWeekStart, weeks, totals]);

  const maxAmount = useMemo(
    () => Math.max(0, ...grid.flat().map((c) => c.amount)),
    [grid],
  );

  // Month label sits above the first column whose Monday belongs to a new month
  const monthLabels = useMemo(() => {
    const out: { col: number; label: string }[] = [];
    let prev = -1;
    grid.forEach((col, i) => {
      const m = col[0].date.getMonth();
      if (m !== prev) {
        out.push({ col: i, label: format(col[0].date, "LLL", { locale: uk }) });
        prev = m;
      }
    });
    return out;
  }, [grid]);

  const totalShown = useMemo(
    () => grid.flat().reduce((s, c) => s + c.amount, 0),
    [grid],
  );

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-foreground/55" />
          <h3 className="text-sm font-semibold">Активність витрат</h3>
        </div>
        <span className="text-[11px] text-foreground/45">
          {weeks} тижнів · {formatMoney(totalShown, currency)}
        </span>
      </div>

      <div className="overflow-x-auto pb-1">
        {/* w-full: stretch to parent width on desktop.
            min-w-max: but never shrink below natural content width — this is
            what triggers the horizontal scrollbar on narrow viewports
            instead of cramming cells. */}
        <div className="flex w-full min-w-max flex-col gap-1.5">
          {/* Month labels row, aligned with grid columns */}
          <div className="flex gap-1.5">
            <div className="w-6 shrink-0" />
            <div className="flex flex-1 gap-0.75">
              {grid.map((_, i) => {
                const ml = monthLabels.find((m) => m.col === i);
                return (
                  <div
                    key={i}
                    className="min-w-3.5 max-w-5.5 flex-1 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-foreground/45"
                  >
                    {ml?.label ?? ""}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-1.5">
            {/* Sparse weekday labels (Mon / Wed / Fri) */}
            <div className="flex w-6 shrink-0 flex-col gap-0.75" aria-hidden>
              {["Пн", "", "Ср", "", "Пт", "", ""].map((label, i) => (
                <div
                  key={i}
                  className="flex flex-1 items-center text-[10px] text-foreground/45"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Grid — columns flex-1 with a min/max so they stretch on
                desktop (up to ~22px each) but never shrink below 14px,
                keeping cells GitHub-sized and forcing overflow on phones. */}
            <div className="flex flex-1 gap-0.75">
              {grid.map((col, ci) => (
                <div
                  key={ci}
                  className="flex min-w-3.5 max-w-5.5 flex-1 flex-col gap-0.75"
                >
                  {col.map((cell) => {
                    const future = cell.date > today;
                    const level = bucket(cell.amount, maxAmount);
                    const isHovered = hovered?.iso === cell.iso;
                    return (
                      <button
                        key={cell.iso}
                        type="button"
                        onMouseEnter={() => setHovered(cell)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(cell)}
                        onBlur={() => setHovered(null)}
                        onClick={() => setHovered(cell)}
                        disabled={future}
                        aria-label={`${format(cell.date, "d MMMM yyyy", { locale: uk })}: ${formatMoney(cell.amount, currency)}`}
                        style={future ? undefined : intensityStyle(level)}
                        className={cn(
                          "aspect-square w-full rounded-[3px] outline-none transition-colors",
                          future
                            ? "border border-dashed border-foreground/10 bg-transparent"
                            : "hover:brightness-110 focus-visible:brightness-110",
                          isHovered &&
                            !future &&
                            "inset-ring-2 inset-ring-foreground/55",
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: hovered-cell readout on the left, intensity legend on the right */}
      <div className="mt-3 flex items-center justify-between gap-3 text-[11px]">
        <div className="min-w-0 truncate text-foreground/55">
          {hovered ? (
            <>
              <span className="font-semibold text-foreground">
                {format(parseISO(hovered.iso), "d MMMM yyyy", { locale: uk })}
              </span>{" "}
              ·{" "}
              {hovered.amount > 0
                ? formatMoney(hovered.amount, currency)
                : "немає витрат"}
            </>
          ) : (
            "Наведи на день, щоб побачити суму"
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 text-foreground/45">
          <span className="text-[10px]">менше</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <span
              key={l}
              style={intensityStyle(l)}
              className="h-2.5 w-2.5 rounded-xs"
            />
          ))}
          <span className="text-[10px]">більше</span>
        </div>
      </div>
    </div>
  );
}
