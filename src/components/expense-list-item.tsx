"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { Expense, Category } from "@/types/expense";
import { formatMoney } from "@/lib/utils";

interface ExpenseListItemProps {
  expense: Expense;
  category?: Category;
  currency: string;
  person1Name: string;
  person2Name: string;
  person1Color?: string;
  person2Color?: string;
  onEdit: (e: Expense) => void;
  onDelete: (e: Expense) => void;
  onView?: (e: Expense) => void;
}

export function ExpenseListItem({
  expense,
  category,
  currency,
  person1Name,
  person2Name,
  person1Color = "#22c55e",
  person2Color = "#3b82f6",
  onEdit,
  onDelete,
  onView,
}: ExpenseListItemProps) {
  const borderColor = expense.paidBy === "person1" ? person1Color : person2Color;
  
  // Parse RGB from hex color
  const r = parseInt(borderColor.slice(1, 3), 16);
  const g = parseInt(borderColor.slice(3, 5), 16);
  const b = parseInt(borderColor.slice(5, 7), 16);

  return (
    <div
      className="glass-card group rounded-2xl p-3 transition-all hover:scale-[1.01] hover:shadow-md sm:p-4"
      style={{
        borderLeft: `3px solid ${borderColor}`,
        boxShadow: `0 8px 32px rgba(${r}, ${g}, ${b}, 0.1)`,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Clickable area — opens detail on mobile */}
        <div
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 sm:cursor-default"
          onClick={() => onView?.(expense)}
        >
          {/* Emoji */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg sm:h-11 sm:w-11 sm:text-xl"
            style={{ backgroundColor: (category?.color ?? "#94a3b8") + "18" }}
          >
            {expense.emoji || category?.emoji || "📦"}
          </div>

          {/* Details — takes remaining space */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <p className="truncate text-sm font-semibold sm:text-base">
                {expense.title}
              </p>
              <span
                className="hidden shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium sm:inline"
                style={{
                  backgroundColor: (category?.color ?? "#94a3b8") + "20",
                  color: category?.color ?? "#94a3b8",
                }}
              >
                {category?.name ?? "Інше"}
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-foreground/40 sm:text-xs">
              <span
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    expense.paidBy === "person1" ? person1Color : person2Color,
                }}
              />
              <span className="truncate">
                {expense.paidBy === "person1" ? person1Name : person2Name} ·{" "}
                {expense.date}
                {expense.note ? ` · ${expense.note}` : ""}
              </span>
            </p>
          </div>
        </div>

        {/* Amount */}
        <p className="shrink-0 text-sm font-bold tabular-nums sm:text-base">
          {formatMoney(expense.amount, currency)}
        </p>

        {/* Actions — always visible on mobile, hover on desktop */}
        <div className="flex shrink-0 gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
          <button
            onClick={() => onEdit(expense)}
            className="flex h-9 w-9 touch-manipulation items-center justify-center rounded-xl text-foreground/30 transition-colors hover:bg-foreground/10 hover:text-foreground active:bg-foreground/10"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(expense)}
            className="flex h-9 w-9 touch-manipulation items-center justify-center rounded-xl text-foreground/30 transition-colors hover:bg-rose-500/10 hover:text-rose-500 active:bg-rose-500/10 active:text-rose-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
