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
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseListItem({
  expense,
  category,
  currency,
  person1Name,
  person2Name,
  onEdit,
  onDelete,
}: ExpenseListItemProps) {
  return (
    <div className="glass-card group flex items-center gap-3 rounded-2xl p-4 transition-all hover:scale-[1.01] hover:shadow-md sm:gap-4">
      {/* Emoji */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ backgroundColor: (category?.color ?? "#94a3b8") + "18" }}
      >
        {expense.emoji || category?.emoji || "📦"}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="truncate font-semibold">{expense.title}</p>
          <span className="shrink-0 rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] font-medium text-foreground/40">
            {category?.name ?? "Другое"}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-foreground/40">
          {expense.paidBy === "person1" ? person1Name : person2Name} ·{" "}
          {expense.date}
          {expense.note ? ` · ${expense.note}` : ""}
        </p>
      </div>

      {/* Amount */}
      <p className="shrink-0 text-base font-bold tabular-nums">
        {formatMoney(expense.amount, currency)}
      </p>

      {/* Actions */}
      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(expense)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(expense.id)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
