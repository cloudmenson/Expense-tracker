"use client";

interface BudgetProgressProps {
  spent: number;
  budget: number;
  currency: string;
}

export function BudgetProgress({
  spent,
  budget,
  currency,
}: BudgetProgressProps) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = spent > budget;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
            Бюджет на місяць
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight">
            {currency} {spent.toLocaleString("en-US")}
            <span className="text-sm font-normal text-foreground/40">
              {" "}
              / {currency} {budget.toLocaleString("en-US")}
            </span>
          </p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isOver
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
              : pct > 80
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {pct.toFixed(0)}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-foreground/5">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isOver
              ? "bg-linear-to-r from-rose-500 to-red-400"
              : pct > 80
                ? "bg-linear-to-r from-amber-500 to-orange-400"
                : "bg-linear-to-r from-emerald-500 to-lime-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isOver && (
        <p className="mt-2 text-xs font-medium text-rose-500">
          Перевищення на {currency} {(spent - budget).toLocaleString("en-US")}
        </p>
      )}
    </div>
  );
}
