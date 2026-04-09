"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const maxW =
    size === "sm"
      ? "sm:max-w-md"
      : size === "lg"
        ? "sm:max-w-2xl"
        : "sm:max-w-lg";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />

        {/* Panel — bottom sheet on mobile, centered card on sm+ */}
        <DialogPrimitive.Content
          onEscapeKeyDown={onClose}
          className={cn(
            "fixed z-50 flex w-full flex-col overflow-hidden",
            "border border-white/15 bg-surface shadow-2xl backdrop-blur-2xl",
            "dark:border-white/10 dark:bg-surface/95",
            // Mobile: bottom sheet
            "bottom-0 left-0 right-0 rounded-t-2xl",
            // Desktop: centered card
            "sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
            "sm:max-h-[90dvh] sm:rounded-2xl",
            maxW,
            "data-[state=open]:slide-in-from-bottom-4",
            "sm:data-[state=open]:zoom-in-95",
            "data-[state=closed]:fade-out-0",
          )}
          style={{
            maxHeight: "calc(100dvh - env(safe-area-inset-top, 0px) - 24px)",
          }}
        >
          {/* Handle — mobile only */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-foreground/15" />
          </div>

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-5 py-3 sm:px-6 sm:pt-5 sm:pb-4">
            <DialogPrimitive.Title className="text-base font-semibold sm:text-lg">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-foreground/5 active:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Закрити</span>
            </DialogPrimitive.Close>
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-foreground/5 sm:mx-6" />

          {/* Scrollable content */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
            {children}
          </div>

          {/* Bottom safe area on mobile */}
          <div
            className="shrink-0 sm:hidden"
            style={{ height: "env(safe-area-inset-bottom, 0px)" }}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
