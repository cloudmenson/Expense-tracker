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
  const { hydrated, hydrate } = useRentalStore();
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

      {!hydrated ? (
        <div className="glass-card flex min-h-40 items-center justify-center gap-2 rounded-2xl text-sm text-foreground/45">
          <Loader2 className="h-4 w-4 animate-spin" />
          Завантаження…
        </div>
      ) : tab === "months" ? (
        <MonthsSection ref={monthsRef} />
      ) : (
        <ContactsSection ref={contactsRef} />
      )}
    </div>
  );
}
