"use client";

import { useState, useCallback } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";
import { StoreProvider } from "@/components/store-provider";
import { ToastProvider } from "@/components/ui/toast";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { SplashScreen } from "@/components/splash-screen";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashFinish = useCallback(() => setSplashDone(true), []);

  return (
    <ThemeProvider>
      {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}

      <StoreProvider>
        <ToastProvider>
          <AppShell>{children}</AppShell>
          <ServiceWorkerRegister />
        </ToastProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
