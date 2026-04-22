"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97] transition-all duration-150",
  {
    variants: {
      variant: {
        primary: "btn-primary",
        secondary: "btn-secondary",
        ghost: [
          "inline-flex items-center justify-center gap-2",
          "min-h-[40px] rounded-xl px-4 py-2",
          "text-sm font-medium text-foreground/55",
          "cursor-pointer hover:text-foreground hover:bg-foreground/6",
        ].join(" "),
        danger: [
          "inline-flex items-center justify-center gap-2",
          "min-h-[44px] rounded-xl px-4 border",
          "border-foreground/10 bg-foreground/6",
          "text-sm font-semibold text-foreground/65",
          "cursor-pointer hover:border-rose-400/30 hover:bg-rose-500/8 hover:text-rose-500",
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
