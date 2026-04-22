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
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/45">
            Доходи за місяць
          </p>
          <p className="animate-count-up mt-1 text-2xl font-black tracking-tight sm:text-[1.8rem]">
            {formatMoney(totalIncome, currency)}
          </p>
        </div>
        <div className="rounded-xl bg-foreground/6 px-3 py-1 text-xs font-semibold text-foreground/55 ring-1 ring-foreground/8">
          {isOverBudget
            ? `Перевитрата ${formatMoney(Math.abs(remaining), currency)}`
            : `Залишок ${formatMoney(remaining, currency)}`}
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs text-foreground/40">
          <span>
            Витрачено {formatMoney(totalSpent, currency)} з{" "}
            {formatMoney(totalIncome, currency)}
          </span>
          <span className="font-semibold text-foreground/55">
            {Math.round(totalProgress)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-foreground/8">
          <div
            className="h-full rounded-full bg-foreground/30 transition-all"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="glass-pill flex items-center gap-3 rounded-xl px-3 py-2.5">
          <PersonAvatar
            name={person1Name}
            color={person1Color}
            avatarImage={person1AvatarImage}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-semibold"
              style={{ color: person1Color }}
            >
              {person1Name}
            </p>
            <p className="text-base font-semibold tabular-nums">
              {formatMoney(person1Income, currency)}
            </p>
          </div>
        </div>
        <div className="glass-pill flex items-center gap-3 rounded-xl px-3 py-2.5">
          <PersonAvatar
            name={person2Name}
            color={person2Color}
            avatarImage={person2AvatarImage}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-semibold"
              style={{ color: person2Color }}
            >
              {person2Name}
            </p>
            <p className="text-base font-semibold tabular-nums">
              {formatMoney(person2Income, currency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
