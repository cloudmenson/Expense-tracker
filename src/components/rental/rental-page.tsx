"use client";

import { useEffect, useState } from "react";
import { Calendar, Users, Loader2, type LucideIcon } from "lucide-react";
import { useRentalStore } from "@/lib/rental-store";
import { ContactsSection } from "./contacts-section";
import { MonthsSection } from "./months-section";

type Tab = "months" | "contacts";

const TABS: { key: Tab; label: string; icon: LucideIcon }[] = [
  { key: "months", label: "Місяці", icon: Calendar },
  { key: "contacts", label: "Контакти", icon: Users },
];

export function RentalPage() {
  const { hydrated, hydrate } = useRentalStore();
  const [tab, setTab] = useState<Tab>("months");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Оренда
        </h1>
        <p className="text-sm text-foreground/55">
          Контакти, тарифи й розрахунки за місяцями
        </p>
      </div>

      <div className="glass-pill inline-flex w-full gap-1 rounded-2xl p-1.5 sm:w-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm ${
                active
                  ? "bg-active"
                  : "text-foreground/55 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {!hydrated ? (
        <div className="glass-card flex min-h-40 items-center justify-center gap-2 rounded-2xl text-sm text-foreground/45">
          <Loader2 className="h-4 w-4 animate-spin" />
          Завантаження…
        </div>
      ) : tab === "months" ? (
        <MonthsSection />
      ) : (
        <ContactsSection />
      )}
    </div>
  );
}
