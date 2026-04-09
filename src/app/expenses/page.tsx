"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Receipt, ChevronRight } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { formatMoney } from "@/lib/utils";
import { ExpenseForm } from "@/components/expense-form";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";

export default function ExpensesPage() {
  const { expenses, categories, settings } = useExpenseStore();
  const [showForm, setShowForm] = useState(false);

  const grouped = useMemo(() => {
    return categories
      .map((cat) => {
        const items = expenses.filter((e) => e.categoryId === cat.id);
        return {
          cat,
          count: items.length,
          total: items.reduce((s, e) => s + e.amount, 0),
        };
      })
      .filter((g) => g.count > 0)
      .sort((a, b) => b.total - a.total);
  }, [expenses, categories]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Витрати
          </h1>
          <p className="mt-1 text-sm text-foreground/50">
            {expenses.length} записів · {formatMoney(total, settings.currency)}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary self-start"
        >
          <Plus className="h-4 w-4" />
          Додати
        </button>
      </div>

      {/* Category cards */}
      {grouped.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Немає витрат"
          description="Додайте першу витрату"
          action={
            expenses.length === 0
              ? { label: "Додати витрату", onClick: () => setShowForm(true) }
              : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {grouped.map(({ cat, count, total }) => {
            const countLabel =
              count === 1
                ? "1 чек"
                : count < 5
                  ? `${count} чеки`
                  : `${count} чеків`;
            return (
              <Link
                key={cat.id}
                href={`/expenses/${cat.id}`}
                className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors hover:bg-foreground/5 active:bg-foreground/8"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{
                    backgroundColor: cat.color
                      ? `${cat.color}22`
                      : "rgba(0,0,0,0.05)",
                  }}
                >
                  {cat.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {cat.name}
                  </p>
                  <p className="text-xs text-foreground/40">{countLabel}</p>
                </div>
                <span className="shrink-0 font-bold text-foreground">
                  {formatMoney(total, settings.currency)}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-foreground/25" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Add form modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Нова витрата"
        size="md"
      >
        <ExpenseForm onDone={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
