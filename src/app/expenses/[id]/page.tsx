"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Receipt,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { formatMoney, filterByMonth, monthLabel } from "@/lib/utils";
import { ExpenseListItem } from "@/components/expense-list-item";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseDetail } from "@/components/expense-detail";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import type { Expense } from "@/types/expense";

type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export default function CategoryExpensesPage() {
  const { id } = useParams<{ id: string }>();
  const { expenses, categories, settings, deleteExpense } = useExpenseStore();

  const cat = categories.find((c) => c.id === id);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [viewing, setViewing] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedPerson, setSelectedPerson] = useState<
    "all" | "person1" | "person2"
  >("all");
  const [sortBy, setSortBy] = useState<SortKey>("date-desc");
  const [showFilters, setShowFilters] = useState(false);

  // All expenses for this category
  const catExpenses = useMemo(
    () => expenses.filter((e) => e.categoryId === id),
    [expenses, id],
  );

  const monthsWithExpenses = useMemo(() => {
    const monthSet = new Set(catExpenses.map((e) => e.date.slice(0, 7)));
    return Array.from(monthSet).sort().reverse();
  }, [catExpenses]);

  const filtered = useMemo(() => {
    let result = [...catExpenses];

    if (selectedMonth !== "all") result = filterByMonth(result, selectedMonth);
    if (selectedPerson !== "all")
      result = result.filter((e) => e.paidBy === selectedPerson);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.note?.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return b.date.localeCompare(a.date);
        case "date-asc":
          return a.date.localeCompare(b.date);
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
      }
    });

    return result;
  }, [catExpenses, selectedMonth, selectedPerson, search, sortBy]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const activeFilterCount = [
    selectedMonth !== "all",
    selectedPerson !== "all",
    search.trim() !== "",
    sortBy !== "date-desc",
  ].filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div className="flex items-start gap-3">
        <Link
          href="/expenses"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground/5 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {cat && (
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                style={{
                  backgroundColor: cat.color
                    ? `${cat.color}22`
                    : "rgba(0,0,0,0.06)",
                }}
              >
                {cat.emoji}
              </div>
            )}
            <h1 className="truncate text-2xl font-bold tracking-tight">
              {cat?.name ?? "Категорія"}
            </h1>
          </div>
          <p className="mt-0.5 text-sm text-foreground/50">
            {filtered.length} записів · {formatMoney(total, settings.currency)}
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary mt-0.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Додати
        </button>
      </div>

      {/* Month pills */}
      {monthsWithExpenses.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <button
            onClick={() => setSelectedMonth("all")}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              selectedMonth === "all"
                ? "bg-rose-500 text-white shadow-sm shadow-rose-500/30"
                : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
            }`}
          >
            Всі
          </button>
          {monthsWithExpenses.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                selectedMonth === m
                  ? "bg-rose-500 text-white shadow-sm shadow-rose-500/30"
                  : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
              }`}
            >
              {monthLabel(m)}
            </button>
          ))}
        </div>
      )}

      {/* Search + filters row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30" />
          <input
            type="text"
            placeholder="Пошук..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass w-full pl-9"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`relative flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-all ${
            showFilters || activeFilterCount > 0
              ? "bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/30 dark:text-pink-400"
              : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Expandable filter panel */}
      {showFilters && (
        <div className="glass-card grid grid-cols-2 gap-3 rounded-2xl p-4">
          {/* Person */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Хто платив
            </label>
            <div className="flex gap-1.5">
              {(
                [
                  { val: "all", label: "Всі" },
                  { val: "person1", label: settings.person1Name },
                  { val: "person2", label: settings.person2Name },
                ] as const
              ).map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setSelectedPerson(val)}
                  className={`flex-1 rounded-xl px-2 py-2 text-xs font-medium transition-all ${
                    selectedPerson === val
                      ? "bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/30 dark:text-pink-400"
                      : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Сортування
            </label>
            <div className="flex flex-col gap-1">
              {(
                [
                  { val: "date-desc", label: "Нові спочатку" },
                  { val: "date-asc", label: "Старі спочатку" },
                  { val: "amount-desc", label: "Дорогі спочатку" },
                  { val: "amount-asc", label: "Дешеві спочатку" },
                ] as { val: SortKey; label: string }[]
              ).map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setSortBy(val)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                    sortBy === val
                      ? "bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/30 dark:text-pink-400"
                      : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                  }`}
                >
                  <ArrowUpDown className="h-3 w-3 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setSelectedPerson("all");
                setSortBy("date-desc");
                setSearch("");
                setSelectedMonth("all");
              }}
              className="col-span-2 rounded-xl bg-foreground/5 py-2 text-sm font-medium text-foreground/50 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              Скинути всі фільтри
            </button>
          )}
        </div>
      )}

      {/* Expenses list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Нічого не знайдено"
          description={
            catExpenses.length === 0
              ? "Додайте першу витрату в цю категорію"
              : "Спробуйте змінити фільтри"
          }
          action={
            catExpenses.length === 0
              ? {
                  label: "Додати витрату",
                  onClick: () => setShowForm(true),
                }
              : undefined
          }
        />
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl">
          {filtered.map((exp) => (
            <ExpenseListItem
              key={exp.id}
              expense={exp}
              category={cat}
              currency={settings.currency}
              person1Name={settings.person1Name}
              person2Name={settings.person2Name}
              person1Color={settings.person1Color}
              person2Color={settings.person2Color}
              onView={(e) => setViewing(e)}
            />
          ))}
        </div>
      )}

      {/* Add / edit form modal */}
      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        title={editing ? "Редагувати витрату" : "Нова витрата"}
        size="md"
      >
        <ExpenseForm
          expense={editing}
          defaultCategoryId={id}
          onDone={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        title="Видалити витрату"
        size="sm"
      >
        <p className="mb-6 text-sm text-foreground/60">
          Ви впевнені, що хочете видалити{" "}
          <span className="font-semibold text-foreground">
            {expenseToDelete?.emoji || "📦"} {expenseToDelete?.title}
          </span>{" "}
          на суму{" "}
          <span className="font-semibold text-foreground">
            {formatMoney(expenseToDelete?.amount ?? 0, settings.currency)}
          </span>
          ?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setExpenseToDelete(null)}
            className="rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/10"
          >
            Скасувати
          </button>
          <button
            onClick={() => {
              if (expenseToDelete) {
                deleteExpense(expenseToDelete.id);
                setExpenseToDelete(null);
              }
            }}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
          >
            Видалити
          </button>
        </div>
      </Modal>

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
            category={cat}
            currency={settings.currency}
            person1Name={settings.person1Name}
            person2Name={settings.person2Name}
            person1Color={settings.person1Color}
            person2Color={settings.person2Color}
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
