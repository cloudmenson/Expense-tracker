"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { Expense, Category } from "@/types/expense";
import { PersonAvatar } from "@/components/person-avatar";
import { formatMoney } from "@/lib/utils";

interface ExpenseDetailProps {
  expense: Expense;
  category?: Category;
  currency: string;
  person1Name: string;
  person2Name: string;
  person1Color?: string;
  person2Color?: string;
  person1AvatarImage?: string;
  person2AvatarImage?: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExpenseDetail({
  expense,
  category,
  currency,
  person1Name,
  person2Name,
  person1Color = "#e11d48",
  person2Color = "#3b82f6",
  person1AvatarImage,
  person2AvatarImage,
  onEdit,
  onDelete,
}: ExpenseDetailProps) {
  const isPerson1 = expense.paidBy === "person1";
  const personName = isPerson1 ? person1Name : person2Name;
  const personColor = isPerson1 ? person1Color : person2Color;
  const personAvatarImage = isPerson1 ? person1AvatarImage : person2AvatarImage;

  return (
    <div className="space-y-5">
      {/* Header — emoji + title + amount */}
      <div className="flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ backgroundColor: (category?.color ?? "#94a3b8") + "18" }}
        >
          {expense.emoji || category?.emoji || "📦"}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold">{expense.title}</h3>
          <p className="mt-0.5 text-2xl font-extrabold text-rose-600 dark:text-pink-400">
            {formatMoney(expense.amount, currency)}
          </p>
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-3">
        {/* Category */}
        <div className="glass-pill flex items-center justify-between rounded-xl px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-foreground/40">
            Категорія
          </span>
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: category?.color ?? "#94a3b8" }}
            />
            {category?.emoji} {category?.name ?? "Інше"}
          </span>
        </div>

        {/* Date */}
        <div className="glass-pill flex items-center justify-between rounded-xl px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-foreground/40">
            Дата
          </span>
          <span className="text-sm font-semibold">{expense.date}</span>
        </div>

        {/* Paid by */}
        <div className="glass-pill flex items-center justify-between rounded-xl px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-foreground/40">
            Хто платив
          </span>
          <span className="flex items-center gap-2 text-sm font-semibold">
            <PersonAvatar
              name={personName}
              color={personColor}
              avatarImage={personAvatarImage}
              size="xs"
            />
            {personName}
          </span>
        </div>

        {/* Note */}
        {expense.note && (
          <div className="glass-pill rounded-xl px-4 py-3">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-foreground/40">
              Нотатка
            </span>
            <p className="text-sm text-foreground/70">{expense.note}</p>
          </div>
        )}

        {/* Items (shopping list) */}
        {expense.items && expense.items.length > 0 && (
          <div className="glass-pill rounded-xl px-4 py-3">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-foreground/40">
              Товари ({expense.items.length})
            </span>
            <div className="space-y-1.5">
              {expense.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground/70">{item.name}</span>
                  <span className="font-semibold tabular-nums">
                    {formatMoney(item.price, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit & Delete buttons */}
      <div className="flex gap-3">
        <button onClick={onEdit} className="btn-primary flex-1">
          <Pencil className="h-4 w-4" />
          Редагувати
        </button>

        <button
          onClick={onDelete}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-500/10 px-6 font-medium text-rose-500 transition-colors hover:bg-rose-500/20 active:bg-rose-500/20"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
