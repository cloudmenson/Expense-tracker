"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "btn-primary",
        secondary: "btn-secondary",
        ghost: [
          "inline-flex items-center justify-center gap-2",
          "min-h-[44px] px-3 py-2 rounded-xl",
          "text-sm font-medium text-foreground/70",
          "transition-all cursor-pointer",
          "hover:bg-foreground/8 hover:text-foreground",
        ].join(" "),
        danger: [
          "inline-flex items-center justify-center gap-2",
          "min-h-[44px] px-5 rounded-xl border",
          "border-rose-500/20 bg-rose-500/5",
          "text-sm font-semibold text-rose-600",
          "transition-colors cursor-pointer",
          "hover:bg-rose-500/10 dark:text-rose-400",
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
