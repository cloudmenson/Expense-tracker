"use client";

import { useMemo, useState } from "react";
import { Plus, Wallet, TrendingUp, Users } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import {
  formatMoney,
  getMonthSummary,
  getCategoryBreakdown,
  currentMonthKey,
  getLastMonths,
  filterByMonth,
} from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import { BudgetProgress } from "@/components/budget-progress";
import { MonthlyBarChart, CategoryPieChart } from "@/components/charts";
import { SpendingHeatmap } from "@/components/spending-heatmap";
import { ExpenseListItem } from "@/components/expense-list-item";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseDetail } from "@/components/expense-detail";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import type { Expense } from "@/types/expense";

export default function DashboardPage() {
  const {
    expenses,
    categories,
    settings,
    deleteExpense,
    _hydrated,
    _mutating,
  } = useExpenseStore();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [viewing, setViewing] = useState<Expense | null>(null);

  const monthKey = currentMonthKey();
  const summary = useMemo(
    () => getMonthSummary(expenses, monthKey),
    [expenses, monthKey],
  );
  const prevMonthKey = getLastMonths(2)[0];
  const prevSummary = useMemo(
    () => getMonthSummary(expenses, prevMonthKey),
    [expenses, prevMonthKey],
  );
  const trend =
    prevSummary.total > 0
      ? ((summary.total - prevSummary.total) / prevSummary.total) * 100
      : 0;

  const catBreakdown = useMemo(
    () => getCategoryBreakdown(filterByMonth(expenses, monthKey), categories),
    [expenses, categories, monthKey],
  );

  const pieData = catBreakdown.map((cb) => {
    const cat = categories.find((c) => c.id === cb.categoryId);
    return {
      name: cat?.name ?? "Інше",
      value: cb.total,
      color: cat?.color ?? "#94a3b8",
    };
  });

  // Monthly chart data for last 6 months
  const last6 = getLastMonths(6);
  const monthlyChartData = last6.map((mk) => {
    const ms = getMonthSummary(expenses, mk);
    return {
      month: ms.label.split(" ")[0]?.slice(0, 3) ?? mk,
      total: ms.total,
      person1: ms.person1Total,
      person2: ms.person2Total,
    };
  });

  const recentExpenses = expenses.slice(0, 5);

  if (!_hydrated) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-24 animate-pulse rounded-xl bg-foreground/8" />
            <div className="h-4 w-36 animate-pulse rounded-lg bg-foreground/5" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded-xl bg-foreground/8" />
        </div>
        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass-card space-y-3 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 animate-pulse rounded-lg bg-foreground/8" />
                <div className="h-9 w-9 animate-pulse rounded-xl bg-foreground/8" />
              </div>
              <div className="h-7 w-24 animate-pulse rounded-xl bg-foreground/8" />
            </div>
          ))}
        </div>
        {/* Budget progress */}
        <div className="glass-card space-y-4 rounded-xl p-4 sm:p-6">
          <div className="h-5 w-32 animate-pulse rounded-lg bg-foreground/8" />
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded-xl bg-foreground/8" />
            <div className="h-4 w-full animate-pulse rounded-xl bg-foreground/8" />
          </div>
        </div>
        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="glass-card rounded-xl p-4 sm:p-6">
              <div className="mb-4 h-5 w-36 animate-pulse rounded-lg bg-foreground/8" />
              <div className="h-44 w-full animate-pulse rounded-xl bg-foreground/5" />
            </div>
          ))}
        </div>
        {/* Recent expenses */}
        <div className="space-y-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-5 w-32 animate-pulse rounded-lg bg-foreground/8" />
            <div className="h-3.5 w-16 animate-pulse rounded-lg bg-foreground/5" />
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="glass-card flex items-center gap-3 rounded-xl px-4 py-3.5"
            >
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-foreground/8" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 animate-pulse rounded-lg bg-foreground/8" />
                <div className="h-3 w-1/3 animate-pulse rounded-lg bg-foreground/5" />
              </div>
              <div className="h-4 w-16 animate-pulse rounded-lg bg-foreground/8" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Огляд
          </h1>
          <p className="mt-1 text-sm text-foreground/50">{summary.label}</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Додати витрату
        </Button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Поки немає витрат"
          description="Додайте першу витрату, щоб почати відстежувати бюджет разом"
          action={{
            label: "Додати витрату",
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Всього за місяць"
              value={formatMoney(summary.total, settings.currency)}
              numericValue={summary.total}
              currency={settings.currency}
              icon={Wallet}
              color="rose"
              trend={trend}
            />
            <StatCard
              label={settings.person1Name}
              labelColor={settings.person1Color}
              value={formatMoney(summary.person1Total, settings.currency)}
              numericValue={summary.person1Total}
              currency={settings.currency}
              icon={Users}
              color="sky"
              avatarImage={settings.person1AvatarImage}
              avatarColor={settings.person1Color}
              avatarName={settings.person1Name}
            />
            <StatCard
              label={settings.person2Name}
              labelColor={settings.person2Color}
              value={formatMoney(summary.person2Total, settings.currency)}
              numericValue={summary.person2Total}
              currency={settings.currency}
              icon={Users}
              color="rose"
              avatarImage={settings.person2AvatarImage}
              avatarColor={settings.person2Color}
              avatarName={settings.person2Name}
            />
            <StatCard
              label="Середня витрата"
              value={formatMoney(
                filterByMonth(expenses, monthKey).length > 0
                  ? Math.round(
                      summary.total / filterByMonth(expenses, monthKey).length,
                    )
                  : 0,
                settings.currency,
              )}
              numericValue={
                filterByMonth(expenses, monthKey).length > 0
                  ? Math.round(
                      summary.total / filterByMonth(expenses, monthKey).length,
                    )
                  : 0
              }
              currency={settings.currency}
              icon={TrendingUp}
              color="violet"
            />
          </div>

          {/* Budget progress */}
          <BudgetProgress
            person1Income={settings.person1Income}
            person2Income={settings.person2Income}
            totalSpent={summary.total}
            currency={settings.currency}
            person1Name={settings.person1Name}
            person2Name={settings.person2Name}
            person1Color={settings.person1Color}
            person2Color={settings.person2Color}
            person1AvatarImage={settings.person1AvatarImage}
            person2AvatarImage={settings.person2AvatarImage}
          />

          {/* Charts row */}
          <div className="grid gap-4 lg:grid-cols-2">
            <MonthlyBarChart
              data={monthlyChartData}
              person1Name={settings.person1Name}
              person2Name={settings.person2Name}
              person1Color={settings.person1Color}
              person2Color={settings.person2Color}
            />
            <CategoryPieChart
              data={pieData}
              total={summary.total}
              currency={settings.currency}
            />
          </div>

          {/* Spending heatmap */}
          <SpendingHeatmap
            expenses={expenses}
            currency={settings.currency}
          />

          {/* Recent expenses */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Останні витрати</h2>
              <span className="text-xs text-foreground/40">
                {expenses.length} всього
              </span>
            </div>
            <div className="space-y-2">
              {recentExpenses.map((exp) => (
                <ExpenseListItem
                  key={exp.id}
                  expense={exp}
                  category={categories.find((c) => c.id === exp.categoryId)}
                  currency={settings.currency}
                  person1Name={settings.person1Name}
                  person2Name={settings.person2Name}
                  person1Color={settings.person1Color}
                  person2Color={settings.person2Color}
                  person1AvatarImage={settings.person1AvatarImage}
                  person2AvatarImage={settings.person2AvatarImage}
                  onView={(e) => setViewing(e)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Form modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Редагувати витрату" : "Нова витрата"}
        size="md"
        closeOnOverlay={false}
        closeOnEscape={false}
        maxHeight="85dvh"
      >
        <ExpenseForm expense={editing} onDone={() => setShowForm(false)} />
      </Modal>

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        title="Видалити витрату"
        busy={_mutating}
        description={
          expenseToDelete && (
            <>
              Ви впевнені, що хочете видалити{" "}
              <span className="font-semibold text-foreground">
                {expenseToDelete.emoji ? `${expenseToDelete.emoji} ` : ""}
                {expenseToDelete.title}
              </span>{" "}
              на суму{" "}
              <span className="font-semibold text-foreground">
                {formatMoney(expenseToDelete.amount, settings.currency)}
              </span>
              ?
            </>
          )
        }
        onConfirm={async () => {
          if (!expenseToDelete) return;
          const result = await deleteExpense(expenseToDelete.id);
          toast(
            result.ok
              ? "Витрату видалено"
              : (result.error ?? "Не вдалося видалити витрату"),
            result.ok ? "success" : "error",
          );
          if (result.ok) setExpenseToDelete(null);
        }}
      />

      {/* View-only detail modal */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Деталі витрати"
        size="sm"
      >
        {viewing && (
          <ExpenseDetail
            expense={viewing}
            category={categories.find((c) => c.id === viewing.categoryId)}
            currency={settings.currency}
            person1Name={settings.person1Name}
            person2Name={settings.person2Name}
            person1Color={settings.person1Color}
            person2Color={settings.person2Color}
            person1AvatarImage={settings.person1AvatarImage}
            person2AvatarImage={settings.person2AvatarImage}
            onEdit={() => {
              setViewing(null);
              setEditing(viewing);
              setShowForm(true);
            }}
            onDelete={() => {
              setExpenseToDelete(viewing);
              setViewing(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
