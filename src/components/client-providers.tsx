"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";
import { StoreProvider } from "@/components/store-provider";
import { ToastProvider } from "@/components/ui/toast";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StoreProvider>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
