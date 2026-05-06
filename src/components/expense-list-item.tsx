"use client";

import { Package } from "lucide-react";
import type { Expense, Category } from "@/types/expense";
import { PersonAvatar } from "@/components/person-avatar";
import { formatMoney } from "@/lib/utils";

interface ExpenseListItemProps {
  expense: Expense;
  category?: Category;
  currency: string;
  person1Name: string;
  person2Name: string;
  person1Color?: string;
  person2Color?: string;
  person1AvatarImage?: string;
  person2AvatarImage?: string;
  hideCategoryBadge?: boolean;
  onView?: (e: Expense) => void;
}

export function ExpenseListItem({
  expense,
  category,
  currency,
  person1Name,
  person2Name,
  person1Color = "#e11d48",
  person2Color = "#3b82f6",
  person1AvatarImage,
  person2AvatarImage,
  hideCategoryBadge = false,
  onView,
}: ExpenseListItemProps) {
  const isPerson1 = expense.paidBy === "person1";
  const borderColor = isPerson1 ? person1Color : person2Color;
  const categoryColor = category?.color ?? "#94a3b8";
  const payerName = isPerson1 ? person1Name : person2Name;
  const payerAvatarImage = isPerson1 ? person1AvatarImage : person2AvatarImage;

  // Parse RGB from hex color
  const r = parseInt(borderColor.slice(1, 3), 16);
  const g = parseInt(borderColor.slice(3, 5), 16);
  const b = parseInt(borderColor.slice(5, 7), 16);

  return (
    <div
      onClick={() => onView?.(expense)}
      className="glass-card group rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderLeft: `5px solid ${borderColor}`,
      }}
    >
      <div className="flex items-center gap-3">
        {/* Clickable area — opens detail on mobile */}
        <div className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 sm:cursor-default">
          {/* Icon */}
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg sm:h-12 sm:w-12 sm:text-xl"
            style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}
          >
            {expense.emoji || category?.emoji ? (
              <span>{expense.emoji || category?.emoji}</span>
            ) : (
              <Package className="h-5 w-5" />
            )}
          </div>

          {/* Details — takes remaining space */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold sm:text-base">
                {expense.title}
              </p>
              {!hideCategoryBadge && (
                <span
                  className="shrink-0 rounded-lg border px-2 py-0.5 text-[10px] font-semibold leading-4 sm:text-xs sm:leading-5"
                  style={{
                    backgroundColor: `${categoryColor}20`,
                    borderColor: `${categoryColor}60`,
                    color: categoryColor,
                  }}
                >
                  {category?.name ?? "Інше"}
                </span>
              )}
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-foreground/40 sm:text-xs">
              <PersonAvatar
                name={payerName}
                color={borderColor}
                avatarImage={payerAvatarImage}
                size="xs"
              />
              <span className="truncate">
                {payerName} · {expense.date}
                {expense.note ? ` · ${expense.note}` : ""}
              </span>
            </p>
          </div>
        </div>

        {/* Amount */}
        <p className="glass-pill shrink-0 rounded-xl px-3 py-1.5 text-sm font-bold tabular-nums sm:text-base">
          {formatMoney(expense.amount, currency)}
        </p>
      </div>
    </div>
  );
}
