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

  // Show nothing (blank) while loading — the decorative splash from ClientProviders
  // already covers this on first visit; subsequent loads just stay blank briefly.
  if (!hydrated || loading) {
    return null;
  }

  return <>{children}</>;
}
