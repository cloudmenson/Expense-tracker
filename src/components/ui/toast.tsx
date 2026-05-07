"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let _nextId = 0;

const TINT: Record<ToastType, string> = {
  success: "var(--success)",
  error: "var(--danger)",
  info: "var(--brand)",
};

const TINT_SOFT: Record<ToastType, string> = {
  success: "var(--success-soft)",
  error: "var(--danger-soft)",
  info: "var(--brand-soft)",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++_nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-4 right-4 z-100 flex flex-col items-stretch gap-2 lg:bottom-6 lg:left-auto lg:right-6 lg:w-80"
      >
        {toasts.map((t) => {
          const Icon =
            t.type === "success"
              ? CheckCircle2
              : t.type === "error"
                ? XCircle
                : Info;
          return (
            <div
              key={t.id}
              className="animate-in flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium"
              style={{
                background: "var(--surface-strong)",
                color: "var(--foreground)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-lift)",
              }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: TINT_SOFT[t.type],
                  color: TINT[t.type],
                }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <p className="flex-1 leading-snug">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-foreground/45 transition-colors hover:bg-foreground/8 hover:text-foreground"
                aria-label="Закрити"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
