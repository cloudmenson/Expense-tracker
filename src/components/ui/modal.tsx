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
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  tall?: boolean;
  allowOverflow?: boolean;
  /** Explicit cap on panel height (CSS value, e.g. "50dvh"). Overrides the
   *  default near-fullscreen cap. Useful when the content is short and a
   *  full-height panel feels oversized. */
  maxHeight?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  closeOnOverlay = false,
  closeOnEscape = true,
  tall = false,
  allowOverflow = false,
  maxHeight,
}: ModalProps) {
  const maxW =
    size === "sm"
      ? "sm:max-w-md"
      : size === "lg"
        ? "sm:max-w-2xl"
        : "sm:max-w-lg";

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;
        if (closeOnOverlay || closeOnEscape) {
          onClose();
        }
      }}
    >
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/28 backdrop-blur-md transition-opacity duration-200 data-[state=open]:opacity-100 data-[state=closed]:opacity-0 dark:bg-black/45" />

        {/* Panel — bottom sheet on mobile, centered card on sm+ */}
        <DialogPrimitive.Content
          onOpenAutoFocus={(event) => {
            // Prevent Radix from auto-focusing the first focusable element when
            // the dialog opens — on mobile this triggers the keyboard which is
            // an unwanted behaviour for non-form modals.
            event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (!closeOnEscape) {
              event.preventDefault();
              return;
            }
            onClose();
          }}
          onPointerDownOutside={(event) => {
            if (!closeOnOverlay) {
              const target = event.target as HTMLElement | null;
              if (!target?.closest("[data-allow-modal-outside='true']")) {
                event.preventDefault();
              }
            }
          }}
          onInteractOutside={(event) => {
            if (!closeOnOverlay) {
              const target = event.target as HTMLElement | null;
              if (!target?.closest("[data-allow-modal-outside='true']")) {
                event.preventDefault();
              }
            }
          }}
          className={cn(
            "fixed z-50 flex w-full flex-col",
            "glass-panel shadow-[0_40px_120px_rgba(0,0,0,0.4)]",
            // Mobile: bottom sheet
            "bottom-0 left-0 right-0 rounded-t-2xl",
            // Desktop: centered card
            "sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
            !maxHeight && (tall ? "sm:max-h-[96dvh]" : "sm:max-h-[90dvh]"),
            allowOverflow ? "overflow-visible" : "overflow-hidden",
            "sm:rounded-2xl",
            maxW,
            "data-[state=open]:slide-in-from-bottom-4",
            "sm:data-[state=open]:zoom-in-95",
            "data-[state=closed]:fade-out-0",
          )}
          style={{
            maxHeight:
              maxHeight ??
              (tall
                ? "calc(100dvh - env(safe-area-inset-top, 0px) - 8px)"
                : "calc(100dvh - env(safe-area-inset-top, 0px) - 24px)"),
          }}
        >
          {/* Handle — mobile only */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="h-1 w-10 rounded-xl bg-foreground/15" />
          </div>

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-5 py-3 sm:px-6 sm:pt-5 sm:pb-4">
            <DialogPrimitive.Title className="text-base font-semibold sm:text-lg">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/6 ring-1 ring-foreground/8 transition-colors hover:bg-foreground/10 focus-visible:outline-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Закрити</span>
            </DialogPrimitive.Close>
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-foreground/8 sm:mx-6" />

          {/* Scrollable content */}
          <div
            className={cn(
              "min-h-0 flex-1 px-5 py-4 sm:px-6 sm:py-5",
              allowOverflow
                ? "overflow-visible"
                : "overflow-y-auto overscroll-contain",
            )}
          >
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
