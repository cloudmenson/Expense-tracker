"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "btn-primary",
        secondary: "btn-secondary",
        ghost: [
          "glass-pill inline-flex items-center justify-center gap-2",
          "min-h-[44px] rounded-xl px-4 py-2",
          "text-sm font-semibold text-foreground/74",
          "cursor-pointer transition-all",
          "hover:-translate-y-0.5 hover:text-foreground",
        ].join(" "),
        danger: [
          "inline-flex items-center justify-center gap-2",
          "min-h-[48px] rounded-xl px-5 border",
          "border-rose-400/25 bg-rose-500/12",
          "text-sm font-semibold text-rose-700 dark:text-rose-300",
          "shadow-[0_16px_32px_rgba(244,63,94,0.12)] transition-all cursor-pointer",
          "hover:-translate-y-0.5 hover:bg-rose-500/18",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
