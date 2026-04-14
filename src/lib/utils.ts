import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  subMonths,
} from "date-fns";

/* ── Merge Tailwind classes without conflicts ── */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
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

/* ── Resize an image File to a 256×256 WebP data URL (browser-only) ── */
export async function imageFileToDataUrl(file: File): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });

  return new Promise<string>((resolve, reject) => {
    const img = new window.Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 256;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas_failed"));
        return;
      }

      // Centre-crop to a square before scaling
      const minSide = Math.min(img.width, img.height);
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;

      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
      resolve(canvas.toDataURL("image/webp", 0.88));
    };

    img.onerror = () => reject(new Error("image_failed"));
    img.src = rawDataUrl;
  });
}

/* ── First non-generic emoji or capitalised first letter for a profile ── */
export function profileAvatarFallback(
  name: string,
  avatarEmoji?: string,
): string {
  const emoji = avatarEmoji?.trim();
  if (emoji && emoji !== "👤" && emoji !== "🧑") return emoji;
  return name.trim().charAt(0).toUpperCase() || "👤";
}
