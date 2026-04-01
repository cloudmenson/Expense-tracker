"use client";

import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === "light" ? "dark" : "light";
  const Icon = theme === "light" ? Sun : Moon;

  return (
    <button
      onClick={() => setTheme(next)}
      className="glass-card flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95"
      aria-label="Переключити тему"
    >
      <Icon className="h-4.5 w-4.5 text-foreground/70" />
    </button>
  );
}
