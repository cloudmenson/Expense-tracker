"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Users, Loader2, Plus, type LucideIcon } from "lucide-react";
import { useRentalStore } from "@/lib/rental-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ContactsSection,
  type ContactsSectionHandle,
} from "./contacts-section";
import { MonthsSection, type MonthsSectionHandle } from "./months-section";

type Tab = "months" | "contacts";

const TABS: { key: Tab; label: string; icon: LucideIcon }[] = [
  { key: "months", label: "Місяці", icon: Calendar },
  { key: "contacts", label: "Контакти", icon: Users },
];

const ADD_LABEL: Record<Tab, string> = {
  months: "Місяць",
  contacts: "Контакт",
};

export function RentalPage() {
  const { hydrated, loading, hydrate } = useRentalStore();
  const [tab, setTab] = useState<Tab>("months");

  const monthsRef = useRef<MonthsSectionHandle>(null);
  const contactsRef = useRef<ContactsSectionHandle>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleAdd = () => {
    if (tab === "months") monthsRef.current?.openCreate();
    else contactsRef.current?.openCreate();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Оренда
          </h1>
          <p className="text-sm text-foreground/55">
            Контакти, тарифи й розрахунки за місяцями
          </p>
        </div>
        <Button type="button" onClick={handleAdd} disabled={!hydrated}>
          <Plus className="h-4 w-4" /> {ADD_LABEL[tab]}
        </Button>
      </div>

      <div className="glass-pill inline-flex w-full gap-1 rounded-2xl p-1.5 sm:w-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
                active
                  ? "bg-active"
                  : "text-foreground/55 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Background-fetch indicator — visible right above the section */}
      {hydrated && loading && (
        <div
          className="flex items-center justify-center gap-2 text-xs text-foreground/55"
          aria-live="polite"
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Оновлюємо…
        </div>
      )}

      {!hydrated ? (
        <div className="space-y-4">
          <div className="h-4 w-2/3 animate-pulse rounded-lg bg-foreground/5" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="glass-card flex gap-4 rounded-2xl p-4">
                <div className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-foreground/8" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 animate-pulse rounded-lg bg-foreground/8" />
                  <div className="h-6 w-24 animate-pulse rounded-lg bg-foreground/8" />
                  <div className="h-3 w-full animate-pulse rounded-lg bg-foreground/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : tab === "months" ? (
        <MonthsSection ref={monthsRef} />
      ) : (
        <ContactsSection ref={contactsRef} />
      )}
    </div>
  );
}
