"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Receipt,
  CalendarDays,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { formatMoney } from "@/lib/utils";
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
  const [selectedPerson, setSelectedPerson] = useState<
    "all" | "person1" | "person2"
  >("all");
  const [sortBy, setSortBy] = useState<SortKey>("date-desc");
  const [showFilters, setShowFilters] = useState(false);

  // Date range filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const catExpenses = useMemo(
    () => expenses.filter((e) => e.categoryId === id),
    [expenses, id],
  );

  const filtered = useMemo(() => {
    let result = [...catExpenses];

    // Date range
    if (dateFrom) result = result.filter((e) => e.date >= dateFrom);
    if (dateTo) result = result.filter((e) => e.date <= dateTo);

    // Person
    if (selectedPerson !== "all")
      result = result.filter((e) => e.paidBy === selectedPerson);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.note?.toLowerCase().includes(q),
      );
    }

    // Sort
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
  }, [catExpenses, dateFrom, dateTo, selectedPerson, search, sortBy]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const hasDateFilter = dateFrom || dateTo;
  const activeFilterCount = [
    hasDateFilter,
    selectedPerson !== "all",
    sortBy !== "date-desc",
  ].filter(Boolean).length;

  const clearAllFilters = useCallback(() => {
    setSelectedPerson("all");
    setSortBy("date-desc");
    setSearch("");
    setDateFrom("");
    setDateTo("");
  }, []);

  const p1 = settings.person1Name || "Person 1";
  const p2 = settings.person2Name || "Person 2";
  const p1Initial = p1.charAt(0).toUpperCase();
  const p2Initial = p2.charAt(0).toUpperCase();
  const p1Color = settings.person1Color || "#e11d48";
  const p2Color = settings.person2Color || "#3b82f6";

  return (
    <div className="space-y-4">
      {/* ── Back + header ── */}
      <div className="flex items-start gap-3">
        <Link
          href="/expenses"
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground/5 text-foreground/60 transition-colors hover:bg-foreground/10 hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
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
            <div>
              <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                {cat?.name ?? "Категорія"}
              </h1>
              <p className="text-xs text-foreground/45">
                {filtered.length} записів ·{" "}
                {formatMoney(total, settings.currency)}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary mt-0.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Додати</span>
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="space-y-3">
        {/* Search + filter toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30" />
            <input
              type="text"
              placeholder="Пошук..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-glass w-full pl-9 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
              showFilters || activeFilterCount > 0
                ? "bg-rose-500/15 text-rose-600 dark:text-pink-400"
                : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Person filter pills — always visible */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedPerson("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              selectedPerson === "all"
                ? "bg-foreground text-background shadow-sm"
                : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
            }`}
          >
            Всі
          </button>

          <button
            onClick={() => setSelectedPerson("person1")}
            className={`flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3.5 text-xs font-semibold transition-all ${
              selectedPerson === "person1"
                ? "shadow-sm ring-1 ring-foreground/10"
                : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
            }`}
            style={
              selectedPerson === "person1"
                ? { backgroundColor: `${p1Color}18`, color: p1Color }
                : undefined
            }
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: p1Color }}
            >
              {p1Initial}
            </span>
            {p1}
          </button>

          <button
            onClick={() => setSelectedPerson("person2")}
            className={`flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3.5 text-xs font-semibold transition-all ${
              selectedPerson === "person2"
                ? "shadow-sm ring-1 ring-foreground/10"
                : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
            }`}
            style={
              selectedPerson === "person2"
                ? { backgroundColor: `${p2Color}18`, color: p2Color }
                : undefined
            }
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: p2Color }}
            >
              {p2Initial}
            </span>
            {p2}
          </button>
        </div>
      </div>

      {/* ── Expandable filter panel ── */}
      {showFilters && (
        <div className="glass-card space-y-4 rounded-2xl p-4">
          {/* Date range */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/40">
              <CalendarDays className="h-3.5 w-3.5" />
              Період
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-glass flex-1 text-sm"
              />
              <span className="text-xs text-foreground/30">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-glass flex-1 text-sm"
              />
              {hasDateFilter && (
                <button
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Сортування
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { val: "date-desc" as SortKey, label: "Нові ↓" },
                  { val: "date-asc" as SortKey, label: "Старі ↑" },
                  { val: "amount-desc" as SortKey, label: "Дорогі ↓" },
                  { val: "amount-asc" as SortKey, label: "Дешеві ↑" },
                ] as const
              ).map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setSortBy(val)}
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    sortBy === val
                      ? "bg-foreground text-background"
                      : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset all */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="w-full rounded-xl bg-foreground/5 py-2 text-xs font-medium text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              Скинути фільтри
            </button>
          )}
        </div>
      )}

      {/* ── Expenses list ── */}
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
              ? { label: "Додати витрату", onClick: () => setShowForm(true) }
              : undefined
          }
        />
      ) : (
        <div className="space-y-2.5">
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
              hideCategoryBadge
              onView={(e) => setViewing(e)}
            />
          ))}
        </div>
      )}

      {/* ── Add / edit form modal ── */}
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

      {/* ── Delete confirmation modal ── */}
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

      {/* ── View-only detail modal ── */}
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
