"use client";

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  const stableOnClose = useCallback(onClose, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && stableOnClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, stableOnClose]);

  if (!open) return null;

  const maxW =
    size === "sm" ? "sm:max-w-md" : size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — full-width bottom sheet on mobile, centered card on sm+ */}
      <div
        ref={ref}
        className={`relative flex w-full ${maxW} flex-col overflow-hidden rounded-t-2xl border border-white/15 bg-surface shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-4 sm:max-h-[90dvh] sm:rounded-2xl dark:border-white/10 dark:bg-surface/95`}
        style={{ maxHeight: "calc(100dvh - env(safe-area-inset-top, 0px) - 24px)" }}
      >
        {/* Handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-foreground/15" />
        </div>

        {/* Fixed header */}
        <div className="flex shrink-0 items-center justify-between px-5 py-3 sm:px-6 sm:pt-5 sm:pb-4">
          <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-foreground/5 active:bg-foreground/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-foreground/5 sm:mx-6" />

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
          {children}
        </div>

        {/* Bottom safe area padding on mobile */}
        <div className="shrink-0 sm:hidden" style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </div>
  );
}
