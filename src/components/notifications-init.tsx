"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { useExpenseStore } from "@/lib/store";
import {
  getNotificationsEnabled,
  msUntilNextReminder,
  showBudgetExceeded,
  showDailyReminder,
} from "@/lib/notifications";

/**
 * Mounts invisibly inside the app and handles:
 * 1. Daily 23:00 reminder if no expenses were logged today
 * 2. Budget exceeded notification (once per month)
 */
export function NotificationsInit() {
  const { expenses, settings, _hydrated } = useExpenseStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Daily 23:00 reminder ──────────────────────────────────────────────────
  useEffect(() => {
    if (!_hydrated) return;
    if (!getNotificationsEnabled()) return;

    function schedule() {
      const delay = msUntilNextReminder();
      timerRef.current = setTimeout(async () => {
        if (!getNotificationsEnabled()) return;
        const today = format(new Date(), "yyyy-MM-dd");
        const hasExpensesToday = expenses.some((e) => e.date === today);
        await showDailyReminder(hasExpensesToday);
        // Re-schedule for next day
        schedule();
      }, delay);
    }

    schedule();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hydrated]);

  // ── Budget exceeded watch ─────────────────────────────────────────────────
  useEffect(() => {
    if (!_hydrated) return;
    if (!getNotificationsEnabled()) return;

    const budget = settings.person1Income + settings.person2Income;
    if (budget <= 0) return;

    const currentMonth = format(new Date(), "yyyy-MM");
    const monthlyTotal = expenses
      .filter((e) => e.date.startsWith(currentMonth))
      .reduce((s, e) => s + e.amount, 0);

    if (monthlyTotal > budget) {
      showBudgetExceeded(currentMonth, monthlyTotal, budget, settings.currency);
    }
  }, [_hydrated, expenses, settings]);

  return null;
}
