"use client";

import * as React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "filled" | "ghost" | "soft";
type Size = "sm" | "md" | "lg";

export interface DeleteIconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Visual treatment.
   *  - `filled` (default): wide rose pill — primary destructive action next to a save button.
   *  - `ghost`: square icon button — neutral by default, reveals rose on hover/active.
   *  - `soft`: square icon button with glass-pill base — neutral with subtle background.
   */
  variant?: Variant;
  /** Square size (ignored by `filled`). */
  size?: Size;
  /** Accessible label, also used as title. */
  label?: string;
  /** Show spinner instead of trash icon and disable interaction. */
  loading?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  filled:
    "rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 active:bg-rose-500/20",
  ghost:
    "rounded-xl text-foreground/35 hover:bg-rose-500/10 hover:text-rose-500 active:bg-rose-500/10 active:text-rose-500",
  soft:
    "glass-pill rounded-xl text-foreground/40 hover:bg-rose-500/12 hover:text-rose-500",
};

const SQUARE_SIZE: Record<Size, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

export const DeleteIconButton = React.forwardRef<
  HTMLButtonElement,
  DeleteIconButtonProps
>(
  (
    {
      className,
      type = "button",
      variant = "filled",
      size = "md",
      label = "Видалити",
      loading = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isFilled = variant === "filled";
    const sizeCls = isFilled ? "h-11 px-6 gap-2 font-medium" : SQUARE_SIZE[size];

    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        disabled={disabled || loading}
        className={cn(
          "flex shrink-0 items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-40",
          sizeCls,
          VARIANT_CLASSES[variant],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    );
  },
);
DeleteIconButton.displayName = "DeleteIconButton";
