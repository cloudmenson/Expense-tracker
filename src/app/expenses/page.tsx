"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Receipt,
  ChevronRight,
  Search,
  SlidersHorizontal,
  CalendarDays,
  X,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import "react-day-picker/style.css";
import { useExpenseStore } from "@/lib/store";
import { formatMoney, monthLabel } from "@/lib/utils";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseDetail } from "@/components/expense-detail";
import { ExpenseListItem } from "@/components/expense-list-item";
import { PersonAvatar } from "@/components/person-avatar";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Expense } from "@/types/expense";

type PageTab = "categories" | "all";
type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

const fmtISO = (d: Date) => format(d, "yyyy-MM-dd");

export default function ExpensesPage() {
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
  const [activeTab, setActiveTab] = useState<PageTab>("categories");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [viewing, setViewing] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<
    "all" | "person1" | "person2"
  >("all");
  const [sortBy, setSortBy] = useState<SortKey>("date-desc");
  const [showFilters, setShowFilters] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedMonth, setSelectedMonth] = useState(() =>
    format(new Date(), "yyyy-MM"),
  );

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((cat) => [cat.id, cat])),
    [categories],
  );

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

  const monthOptions = useMemo(() => {
    const currentMonth = format(new Date(), "yyyy-MM");
    const uniqueMonths = Array.from(
      new Set(expenses.map((e) => e.date.slice(0, 7))),
    );
    if (!uniqueMonths.includes(currentMonth)) {
      uniqueMonths.push(currentMonth);
    }
    if (!uniqueMonths.includes(selectedMonth)) {
      uniqueMonths.push(selectedMonth);
    }
    return uniqueMonths.sort((a, b) => b.localeCompare(a));
  }, [expenses, selectedMonth]);

  const monthlyExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(selectedMonth)),
    [expenses, selectedMonth],
  );
  const monthlyTotal = useMemo(
    () => monthlyExpenses.reduce((s, e) => s + e.amount, 0),
    [monthlyExpenses],
  );
  const monthlyBudget = settings.person1Income + settings.person2Income;
  const budgetProgress =
    monthlyBudget > 0 ? Math.min((monthlyTotal / monthlyBudget) * 100, 100) : 0;

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    if (dateRange?.from)
      result = result.filter((e) => e.date >= fmtISO(dateRange.from!));
    if (dateRange?.to)
      result = result.filter((e) => e.date <= fmtISO(dateRange.to!));

    if (selectedPerson !== "all") {
      result = result.filter((e) => e.paidBy === selectedPerson);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((e) => {
        const category = categoryMap[e.categoryId];
        const personName =
          e.paidBy === "person1" ? settings.person1Name : settings.person2Name;
        const formattedDate = format(new Date(e.date), "d MMMM yyyy", {
          locale: uk,
        }).toLowerCase();

        return (
          e.title.toLowerCase().includes(q) ||
          e.note?.toLowerCase().includes(q) ||
          e.date.includes(q) ||
          formattedDate.includes(q) ||
          category?.name.toLowerCase().includes(q) ||
          personName.toLowerCase().includes(q)
        );
      });
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
  }, [
    categoryMap,
    dateRange,
    expenses,
    search,
    selectedPerson,
    settings.person1Name,
    settings.person2Name,
    sortBy,
  ]);

  const filteredTotal = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const hasDateFilter = !!(dateRange?.from || dateRange?.to);
  const activeFilterCount = [
    hasDateFilter,
    selectedPerson !== "all",
    sortBy !== "date-desc",
  ].filter(Boolean).length;

  const clearAllFilters = useCallback(() => {
    setSelectedPerson("all");
    setSortBy("date-desc");
    setSearch("");
    setDateRange(undefined);
    setShowCalendar(false);
  }, []);

  const p1 = settings.person1Name;
  const p2 = settings.person2Name;
  const p1Color = settings.person1Color || "#e11d48";
  const p2Color = settings.person2Color || "#3b82f6";
  const p1Avatar = settings.person1AvatarImage;
  const p2Avatar = settings.person2AvatarImage;

  const dateLabel = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "d MMM", { locale: uk })} — ${format(dateRange.to, "d MMM", { locale: uk })}`
      : format(dateRange.from, "d MMM yyyy", { locale: uk })
    : null;

  if (!_hydrated) {
    return <div className="space-y-6" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Витрати
            </h1>
            <p className="mt-1 text-sm text-foreground/50">
              {expenses.length} записів
            </p>
          </div>

          <button
            onClick={() => {
              if (_mutating) return;
              setEditing(null);
              setShowForm(true);
            }}
            disabled={_mutating}
            className="btn-primary self-start"
          >
            <Plus className="h-4 w-4" />
            Додати
          </button>
        </div>

        <div className="glass-card w-full rounded-xl p-4 sm:p-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/40">
                  Сума за обраний місяць
                </p>
                <p
                  className="mt-1 text-3xl font-black leading-none tracking-tight sm:text-[2.7rem]"
                  style={{ color: "var(--brand-deep)" }}
                >
                  {formatMoney(monthlyTotal, settings.currency)}
                </p>
                <p className="mt-1 text-xs text-foreground/45">
                  {monthLabel(selectedMonth)}
                </p>
              </div>

              <div className="w-full sm:w-56">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((monthKey) => (
                      <SelectItem key={monthKey} value={monthKey}>
                        {monthLabel(monthKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="glass-pill rounded-xl px-3 py-1 text-foreground/65">
                Бюджет: {formatMoney(monthlyBudget, settings.currency)}
              </span>
              <span
                className="glass-pill rounded-xl px-3 py-1 font-semibold text-brand-deep"
                style={{ backgroundColor: "var(--brand-soft)" }}
              >
                Витрачено: {formatMoney(monthlyTotal, settings.currency)}
              </span>
            </div>

            <div className="glass-pill h-2.5 overflow-hidden rounded-xl">
              <div
                className="h-full rounded-xl transition-all"
                style={{
                  width: `${budgetProgress}%`,
                  background:
                    "linear-gradient(90deg, var(--brand-strong), var(--brand))",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="glass-pill inline-flex w-full gap-1 rounded-xl p-1.5 sm:w-auto">
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none ${
            activeTab === "categories"
              ? "btn-primary min-h-0 px-4 py-2.5"
              : "text-foreground/50 hover:text-foreground"
          }`}
        >
          Категорії
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all sm:flex-none ${
            activeTab === "all"
              ? "btn-primary min-h-0 px-4 py-2.5"
              : "text-foreground/50 hover:text-foreground"
          }`}
        >
          Все
        </button>
      </div>

      {activeTab === "categories" ? (
        grouped.length === 0 ? (
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
                  className="glass-card flex items-center gap-3 rounded-xl px-4 py-3.5 transition-colors hover:bg-white/10 active:bg-white/12"
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
        )
      ) : (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="field-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Пошук по даті, назві, нотатці..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                showFilters || activeFilterCount > 0
                  ? "glass-card text-rose-600 dark:text-pink-300"
                  : "glass-pill text-foreground/50 hover:bg-white/14"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-xl bg-rose-500 text-[9px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="glass-card space-y-4 rounded-xl p-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
                  Хто платив
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPerson("all")}
                    className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all ${
                      selectedPerson === "all"
                        ? "glass-card text-foreground shadow-sm"
                        : "glass-pill text-foreground/50 hover:bg-white/14"
                    }`}
                  >
                    Всі
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPerson("person1")}
                    className={`flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-3.5 text-xs font-semibold transition-all ${
                      selectedPerson === "person1"
                        ? "glass-card shadow-sm ring-1 ring-white/10"
                        : "glass-pill text-foreground/50 hover:bg-white/14"
                    }`}
                    style={
                      selectedPerson === "person1"
                        ? { backgroundColor: `${p1Color}18`, color: p1Color }
                        : undefined
                    }
                  >
                    <PersonAvatar
                      name={p1}
                      color={p1Color}
                      avatarImage={p1Avatar}
                      size="xs"
                    />
                    {p1}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPerson("person2")}
                    className={`flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-3.5 text-xs font-semibold transition-all ${
                      selectedPerson === "person2"
                        ? "glass-card shadow-sm ring-1 ring-white/10"
                        : "glass-pill text-foreground/50 hover:bg-white/14"
                    }`}
                    style={
                      selectedPerson === "person2"
                        ? { backgroundColor: `${p2Color}18`, color: p2Color }
                        : undefined
                    }
                  >
                    <PersonAvatar
                      name={p2}
                      color={p2Color}
                      avatarImage={p2Avatar}
                      size="xs"
                    />
                    {p2}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
                  Період
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCalendar(true)}
                    className={`flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-3.5 text-xs font-semibold transition-all ${
                      hasDateFilter
                        ? "glass-card shadow-sm ring-1 ring-white/10"
                        : "glass-pill text-foreground/50 hover:bg-white/14"
                    }`}
                    style={
                      hasDateFilter
                        ? { backgroundColor: "#e11d4818", color: "#e11d48" }
                        : undefined
                    }
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-xl text-white"
                      style={{ backgroundColor: "#e11d48" }}
                    >
                      <CalendarDays className="h-3 w-3" />
                    </span>
                    {dateLabel ?? "Обрати дати"}
                  </button>
                  {hasDateFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setDateRange(undefined);
                        setShowCalendar(false);
                      }}
                      className="glass-pill flex h-7 w-7 items-center justify-center rounded-xl text-foreground/40 transition-colors hover:bg-white/14"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <Modal
                  open={showCalendar}
                  onClose={() => setShowCalendar(false)}
                  title="Оберіть період"
                  size="sm"
                >
                  <div className="flex justify-center">
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                      }}
                      locale={uk}
                      weekStartsOn={1}
                    />
                  </div>
                </Modal>
              </div>

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
                      type="button"
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

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="w-full rounded-xl bg-foreground/5 py-2 text-xs font-medium text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
                >
                  Скинути фільтри
                </button>
              )}
            </div>
          )}

          {filteredExpenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Нічого не знайдено"
              description={
                expenses.length === 0
                  ? "Додайте першу витрату"
                  : "Спробуйте змінити пошук або фільтри"
              }
              action={
                expenses.length === 0
                  ? {
                      label: "Додати витрату",
                      onClick: () => setShowForm(true),
                    }
                  : undefined
              }
            />
          ) : (
            <div className="space-y-2.5">
              <p className="text-xs text-foreground/45">
                {filteredExpenses.length} записів ·{" "}
                {formatMoney(filteredTotal, settings.currency)}
              </p>
              {filteredExpenses.map((expense) => (
                <ExpenseListItem
                  key={expense.id}
                  expense={expense}
                  category={categoryMap[expense.categoryId]}
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
          )}
        </>
      )}

      {/* Add form modal */}
      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        title={editing ? "Редагувати витрату" : "Нова витрата"}
        size="md"
        closeOnOverlay={false}
        closeOnEscape={false}
        tall
      >
        <ExpenseForm
          expense={editing}
          onDone={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      </Modal>

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
            type="button"
            onClick={() => setExpenseToDelete(null)}
            disabled={_mutating}
            className="rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/10"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={async () => {
              if (_mutating) return;
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
            disabled={_mutating}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
          >
            {_mutating ? "Зачекайте..." : "Видалити"}
          </button>
        </div>
      </Modal>

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Деталі витрати"
        size="sm"
      >
        {viewing && (
          <ExpenseDetail
            expense={viewing}
            category={categoryMap[viewing.categoryId]}
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
