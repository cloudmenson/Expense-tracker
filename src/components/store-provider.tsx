"use client";

import { useEffect } from "react";
import { useExpenseStore } from "@/lib/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useExpenseStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <>{children}</>;
}
