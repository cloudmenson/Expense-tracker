"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const baseClasses =
  "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground/5 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground";

interface BackButtonBaseProps {
  className?: string;
  label?: string;
}

interface BackButtonLinkProps extends BackButtonBaseProps {
  /** Navigate to a specific route (renders a Next.js Link). */
  href: string;
  onClick?: never;
}

interface BackButtonActionProps extends BackButtonBaseProps {
  /** Custom click handler (e.g. close a modal). Renders a button. */
  onClick: () => void;
  href?: never;
}

interface BackButtonRouterProps extends BackButtonBaseProps {
  /** With no href/onClick, defaults to router.back(). */
  href?: never;
  onClick?: never;
}

export type BackButtonProps =
  | BackButtonLinkProps
  | BackButtonActionProps
  | BackButtonRouterProps;

export function BackButton({
  className,
  label = "Назад",
  ...rest
}: BackButtonProps) {
  const router = useRouter();
  const icon = <ArrowLeft className="h-5 w-5" />;
  const merged = cn(baseClasses, className);

  if ("href" in rest && rest.href) {
    return (
      <Link href={rest.href} aria-label={label} className={merged}>
        {icon}
      </Link>
    );
  }

  const handleClick =
    "onClick" in rest && rest.onClick ? rest.onClick : () => router.back();

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={merged}
    >
      {icon}
    </button>
  );
}
