"use client";

import { useEffect } from "react";
import { useExpenseStore } from "@/lib/store";
import { SplashScreen } from "@/components/splash-screen";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useExpenseStore((s) => s.hydrate);
  const hydrated = useExpenseStore((s) => s._hydrated);
  const loading = useExpenseStore((s) => s._loading);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Show splash screen while loading data from MongoDB
  if (!hydrated || loading) {
    return <SplashScreen onFinish={() => {}} />;
  }

  return <>{children}</>;
}
