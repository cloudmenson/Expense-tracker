"use client";

import { useEffect } from "react";
import { useExpenseStore } from "@/lib/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useExpenseStore((s) => s.hydrate);
  const hydrated = useExpenseStore((s) => s._hydrated);
  const loading = useExpenseStore((s) => s._loading);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated && loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-emerald-500/20 border-t-emerald-500" />
          </div>
          <p className="text-sm font-medium text-foreground/40">
            Завантаження даних…
          </p>
        </div>
      </div>
    );
  }

  // If not yet hydrated and not loading (initial state), also show loader briefly
  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-emerald-500/20 border-t-emerald-500" />
          </div>
          <p className="text-sm font-medium text-foreground/40">Підключення…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
