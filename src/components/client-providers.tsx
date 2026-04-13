"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";
import { StoreProvider } from "@/components/store-provider";
import { ToastProvider } from "@/components/ui/toast";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { SplashScreen } from "@/components/splash-screen";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isUnlockRoute = pathname === "/unlock";
  const [splashDone, setSplashDone] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("b4t-splash") === "1";
    }
    return false;
  });
  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
    sessionStorage.setItem("b4t-splash", "1");
  }, []);

  return (
    <ThemeProvider>
      {!splashDone && !isUnlockRoute && (
        <SplashScreen onFinish={handleSplashFinish} />
      )}

      <div className={!splashDone && !isUnlockRoute ? "invisible" : undefined}>
        <StoreProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
            <ServiceWorkerRegister />
          </ToastProvider>
        </StoreProvider>
      </div>
    </ThemeProvider>
  );
}
