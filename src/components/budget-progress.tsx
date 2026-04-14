"use client";

import { PersonAvatar } from "@/components/person-avatar";

interface BudgetProgressProps {
  person1Income: number;
  person2Income: number;
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
  currency,
  person1Name,
  person2Name,
  person1Color,
  person2Color,
  person1AvatarImage,
  person2AvatarImage,
}: BudgetProgressProps) {
  const totalIncome = person1Income + person2Income;

  return (
    <div className="glass-card rounded-2xl p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
            Доходи за місяць
          </p>
          <p className="animate-count-up mt-1 text-2xl font-bold tracking-tight">
            {currency} {Math.round(totalIncome).toLocaleString("en-US")}
          </p>
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
          <div>
            <p className="text-xs text-foreground/45">{person1Name}</p>
            <p className="text-base font-semibold tabular-nums">
              {currency} {Math.round(person1Income).toLocaleString("en-US")}
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
          <div>
            <p className="text-xs text-foreground/45">{person2Name}</p>
            <p className="text-base font-semibold tabular-nums">
              {currency} {Math.round(person2Income).toLocaleString("en-US")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
