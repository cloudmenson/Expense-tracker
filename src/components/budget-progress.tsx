"use client";

import { PersonAvatar } from "@/components/person-avatar";
import { formatMoney } from "@/lib/utils";

interface BudgetProgressProps {
  person1Income: number;
  person2Income: number;
  totalSpent: number;
  currency: string;
  person1Name: string;
  person2Name: string;
  person1Color: string;
  person2Color: string;
  person1AvatarImage?: string;
  person2AvatarImage?: string;
}

export function BudgetProgress({
  person1Income,
  person2Income,
  totalSpent,
  currency,
  person1Name,
  person2Name,
  person1Color,
  person2Color,
  person1AvatarImage,
  person2AvatarImage,
}: BudgetProgressProps) {
  const totalIncome = person1Income + person2Income;
  const remaining = totalIncome - totalSpent;
  const isOverBudget = remaining < 0;

  const totalProgress =
    totalIncome > 0 ? Math.min((totalSpent / totalIncome) * 100, 100) : 0;

  return (
    <div className="glass-card rounded-2xl p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
            Доходи за місяць
          </p>
          <p className="animate-count-up mt-1 text-2xl font-bold tracking-tight">
            {formatMoney(totalIncome, currency)}
          </p>
        </div>
        <div
          className={`rounded-xl px-2.5 py-1 text-xs font-semibold ${
            isOverBudget
              ? "bg-rose-500/15 text-rose-500"
              : "bg-emerald-500/15 text-emerald-500"
          }`}
        >
          {isOverBudget
            ? `Перевитрата ${formatMoney(Math.abs(remaining), currency)}`
            : `Залишок ${formatMoney(remaining, currency)}`}
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs text-foreground/45">
          <span>
            Витрачено {formatMoney(totalSpent, currency)} з{" "}
            {formatMoney(totalIncome, currency)}
          </span>
          <span className="font-semibold text-foreground/65">
            {Math.round(totalProgress)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
          <div
            className={`h-full rounded-full transition-all ${
              isOverBudget ? "bg-rose-500" : "bg-emerald-500"
            }`}
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl bg-foreground/5 px-3 py-2.5">
          <PersonAvatar
            name={person1Name}
            color={person1Color}
            avatarImage={person1AvatarImage}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-foreground/45">{person1Name}</p>
            <p className="text-base font-semibold tabular-nums">
              {formatMoney(person1Income, currency)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-foreground/5 px-3 py-2.5">
          <PersonAvatar
            name={person2Name}
            color={person2Color}
            avatarImage={person2AvatarImage}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-foreground/45">{person2Name}</p>
            <p className="text-base font-semibold tabular-nums">
              {formatMoney(person2Income, currency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
