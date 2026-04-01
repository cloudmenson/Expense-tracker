"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW =
    size === "sm" ? "max-w-md" : size === "lg" ? "max-w-2xl" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={ref}
        className={`relative flex max-h-[92dvh] w-full flex-col ${maxW} animate-in slide-in-from-bottom-4 overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/15 bg-surface/80 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-surface/90`}
      >
        {/* Fixed header */}
        <div className="flex shrink-0 items-center justify-between border-b border-foreground/5 px-6 py-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-foreground/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
