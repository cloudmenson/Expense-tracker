import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  subMonths,
} from "date-fns";
import { uk } from "date-fns/locale";
import type {
  Expense,
  Category,
  MonthSummary,
  CategorySummary,
} from "@/types/expense";

/* ── Format currency ── */
export function formatMoney(amount: number, currency = "$"): string {
  return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/* ── Month label ── */
export function monthLabel(dateStr: string): string {
  return format(parseISO(dateStr + "-01"), "LLLL yyyy", { locale: uk });
}

/* ── Get month key ── */
export function toMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/* ── Filter by month ── */
export function filterByMonth(
  expenses: Expense[],
  monthKey: string,
): Expense[] {
  const start = startOfMonth(parseISO(monthKey + "-01"));
  const end = endOfMonth(start);
  return expenses.filter((e) => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start, end });
  });
}

/* ── Get month summary ── */
export function getMonthSummary(
  expenses: Expense[],
  monthKey: string,
): MonthSummary {
  const filtered = filterByMonth(expenses, monthKey);
  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const person1Total = filtered
    .filter((e) => e.paidBy === "person1")
    .reduce((s, e) => s + e.amount, 0);
  const person2Total = filtered
    .filter((e) => e.paidBy === "person2")
    .reduce((s, e) => s + e.amount, 0);

  const byCategory: Record<string, number> = {};
  for (const e of filtered) {
    byCategory[e.categoryId] = (byCategory[e.categoryId] || 0) + e.amount;
  }

  return {
    month: monthKey,
    label: monthLabel(monthKey),
    total,
    person1Total,
    person2Total,
    byCategory,
  };
}

/* ── Category breakdown ── */
export function getCategoryBreakdown(
  expenses: Expense[],
  categories: Category[],
): CategorySummary[] {
  const totals: Record<string, { total: number; count: number }> = {};
  let grandTotal = 0;

  for (const e of expenses) {
    if (!totals[e.categoryId]) totals[e.categoryId] = { total: 0, count: 0 };
    totals[e.categoryId].total += e.amount;
    totals[e.categoryId].count += 1;
    grandTotal += e.amount;
  }

  return categories
    .map((cat) => ({
      categoryId: cat.id,
      total: totals[cat.id]?.total ?? 0,
      count: totals[cat.id]?.count ?? 0,
      percentage:
        grandTotal > 0 ? ((totals[cat.id]?.total ?? 0) / grandTotal) * 100 : 0,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.total - a.total);
}

/* ── Last N months keys ── */
export function getLastMonths(n: number): string[] {
  const now = new Date();
  return Array.from({ length: n }, (_, i) =>
    format(subMonths(now, i), "yyyy-MM"),
  ).reverse();
}

/* ── Today ISO ── */
export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/* ── Current month key ── */
export function currentMonthKey(): string {
  return format(new Date(), "yyyy-MM");
}
