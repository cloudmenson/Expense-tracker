"use client";

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="glass-card flex flex-col items-center justify-center rounded-xl px-6 py-16 text-center">
      <div className="mb-5 flex h-18 w-18 items-center justify-center rounded-xl bg-rose-500/12 shadow-[0_18px_40px_rgba(239,91,143,0.16)]">
        <Icon className="h-7 w-7 text-rose-500 dark:text-pink-400" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-foreground/56">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-4">
          {action.label}
        </button>
      )}
    </div>
  );
}
