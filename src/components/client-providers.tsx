"use client";

import { useState, useCallback } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";
import { StoreProvider } from "@/components/store-provider";
import { ToastProvider } from "@/components/ui/toast";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { SplashScreen } from "@/components/splash-screen";
import { FallingPetals } from "@/components/falling-petals";

export function ClientProviders({ children }: { children: React.ReactNode }) {
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
      {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}

      <FallingPetals />
      <StoreProvider>
        <ToastProvider>
          <AppShell>{children}</AppShell>
          <ServiceWorkerRegister />
        </ToastProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
