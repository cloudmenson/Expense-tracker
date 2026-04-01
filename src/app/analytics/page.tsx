"use client";

import { useMemo, useState } from "react";
import { BarChart3, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import {
  formatMoney,
  getMonthSummary,
  getCategoryBreakdown,
  getLastMonths,
  filterByMonth,
  currentMonthKey,
} from "@/lib/utils";
import {
  MonthlyBarChart,
  CategoryPieChart,
  SpendingTrendChart,
  PersonCompareChart,
} from "@/components/charts";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { format, parseISO } from "date-fns";

export default function AnalyticsPage() {
  const { expenses, categories, settings } = useExpenseStore();
  const [period, setPeriod] = useState(6);

  const months = useMemo(() => getLastMonths(period), [period]);
  const monthKey = currentMonthKey();

  // Monthly chart
  const monthlyData = useMemo(
    () =>
      months.map((mk) => {
        const ms = getMonthSummary(expenses, mk);
        return {
          month: ms.label.split(" ")[0]?.slice(0, 3) ?? mk,
          total: ms.total,
          person1: ms.person1Total,
          person2: ms.person2Total,
        };
      }),
    [expenses, months],
  );

  // Category pie
  const currentExpenses = useMemo(
    () => filterByMonth(expenses, monthKey),
    [expenses, monthKey],
  );
  const catBreakdown = useMemo(
    () => getCategoryBreakdown(currentExpenses, categories),
    [currentExpenses, categories],
  );
  const pieData = catBreakdown.map((cb) => {
    const cat = categories.find((c) => c.id === cb.categoryId);
    return {
      name: cat?.name ?? "Другое",
      value: cb.total,
      color: cat?.color ?? "#94a3b8",
    };
  });
  const currentTotal = currentExpenses.reduce((s, e) => s + e.amount, 0);

  // Trend chart - daily aggregation for current month
  const trendData = useMemo(() => {
    const daily: Record<string, number> = {};
    for (const e of currentExpenses) {
      daily[e.date] = (daily[e.date] || 0) + e.amount;
    }
    return Object.entries(daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({
        date: format(parseISO(date), "dd.MM"),
        amount,
      }));
  }, [currentExpenses]);

  // Person comparison by category
  const personCompareData = useMemo(() => {
    const catMap: Record<string, { person1: number; person2: number }> = {};
    for (const e of currentExpenses) {
      if (!catMap[e.categoryId])
        catMap[e.categoryId] = { person1: 0, person2: 0 };
      catMap[e.categoryId][e.paidBy] += e.amount;
    }
    return Object.entries(catMap)
      .map(([catId, vals]) => ({
        category: categories.find((c) => c.id === catId)?.name ?? "Другое",
        person1: vals.person1,
        person2: vals.person2,
      }))
      .sort((a, b) => b.person1 + b.person2 - (a.person1 + a.person2))
      .slice(0, 8);
  }, [currentExpenses, categories]);

  // Stats
  const totalAll = expenses.reduce((s, e) => s + e.amount, 0);
  const avgMonthly = months.length > 0 ? totalAll / months.length : 0;
  const biggestExpense =
    expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0;
  const topCategory = catBreakdown[0];
  const topCat = categories.find((c) => c.id === topCategory?.categoryId);

  if (expenses.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Аналитика
        </h1>
        <EmptyState
          icon={BarChart3}
          title="Нет данных для анализа"
          description="Добавьте расходы, чтобы увидеть красивые графики и статистику"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Аналитика
          </h1>
          <p className="mt-1 text-sm text-foreground/50">
            Детальная статистика расходов
          </p>
        </div>
        <div className="flex gap-2">
          {[3, 6, 12].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                period === p
                  ? "bg-emerald-500/15 text-emerald-600 ring-2 ring-emerald-500/30 dark:text-emerald-400"
                  : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
              }`}
            >
              {p} мес
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Всего расходов"
          value={formatMoney(totalAll, settings.currency)}
          icon={Wallet}
          color="emerald"
        />
        <StatCard
          label="В среднем/мес"
          value={formatMoney(Math.round(avgMonthly), settings.currency)}
          icon={TrendingUp}
          color="sky"
        />
        <StatCard
          label="Макс. расход"
          value={formatMoney(biggestExpense, settings.currency)}
          icon={TrendingDown}
          color="rose"
        />
        <StatCard
          label="Топ категория"
          value={topCat ? `${topCat.emoji} ${topCat.name}` : "—"}
          sub={
            topCategory ? formatMoney(topCategory.total, settings.currency) : ""
          }
          icon={BarChart3}
          color="violet"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyBarChart data={monthlyData} />
        <CategoryPieChart
          data={pieData}
          total={currentTotal}
          currency={settings.currency}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SpendingTrendChart data={trendData} />
        <PersonCompareChart data={personCompareData} categories={categories} />
      </div>

      {/* Top expenses table */}
      <div className="glass-card rounded-2xl p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground/40">
          Топ-10 расходов за месяц
        </p>
        <div className="space-y-2">
          {currentExpenses
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10)
            .map((e, i) => {
              const cat = categories.find((c) => c.id === e.categoryId);
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-foreground/5"
                >
                  <span className="w-5 text-right text-xs font-semibold text-foreground/30">
                    {i + 1}
                  </span>
                  <span className="text-lg">
                    {e.emoji || cat?.emoji || "📦"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.title}</p>
                    <p className="text-[10px] text-foreground/40">
                      {cat?.name} · {e.date}
                    </p>
                  </div>
                  <p className="text-sm font-bold tabular-nums">
                    {formatMoney(e.amount, settings.currency)}
                  </p>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
