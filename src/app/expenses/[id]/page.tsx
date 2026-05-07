"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Plus,
  Search,
  Receipt,
  CalendarDays,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import type { DateRange } from "react-day-picker";
import { uk } from "date-fns/locale";
import { format } from "date-fns";
import { useExpenseStore } from "@/lib/store";
import { formatMoney } from "@/lib/utils";
import { ExpenseListItem } from "@/components/expense-list-item";
import { PersonAvatar } from "@/components/person-avatar";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseDetail } from "@/components/expense-detail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DateRangePickerModal } from "@/components/ui/date-range-picker-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import type { Expense } from "@/types/expense";

type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

const fmtISO = (d: Date) => format(d, "yyyy-MM-dd");

export default function CategoryExpensesPage() {
  const { id } = useParams<{ id: string }>();
  const { expenses, categories, settings, deleteExpense, _mutating } =
    useExpenseStore();
  const { toast } = useToast();

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
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const catExpenses = useMemo(
    () => expenses.filter((e) => e.categoryId === id),
    [expenses, id],
  );

  const filtered = useMemo(() => {
    let result = [...catExpenses];

    if (dateRange?.from)
      result = result.filter((e) => e.date >= fmtISO(dateRange.from!));
    if (dateRange?.to)
      result = result.filter((e) => e.date <= fmtISO(dateRange.to!));

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
  }, [catExpenses, dateRange, selectedPerson, search, sortBy]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

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

  return (
    <div className="space-y-4">
      {/* ── Back + header ── */}
      <div className="flex items-start gap-3">
        <BackButton href="/expenses" />
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
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="mt-0.5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Додати</span>
        </Button>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="field-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Пошук..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            showFilters || activeFilterCount > 0
              ? "bg-active"
              : "glass-pill text-foreground/55 hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
              style={{
                background: "var(--background)",
                color: "var(--foreground)",
                boxShadow: "0 0 0 2px var(--foreground)",
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Expandable filter panel ── */}
      {showFilters && (
        <div className="glass-card space-y-4 rounded-xl p-4">
          {/* Person filter */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Хто платив
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedPerson("all")}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all ${
                  selectedPerson === "all"
                    ? "bg-active shadow-sm"
                    : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
                }`}
              >
                Всі
              </button>

              <button
                onClick={() => setSelectedPerson("person1")}
                className={`flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-3.5 text-xs font-semibold transition-all ${
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
                <PersonAvatar
                  name={p1}
                  color={p1Color}
                  avatarImage={p1Avatar}
                  size="xs"
                />
                {p1}
              </button>

              <button
                onClick={() => setSelectedPerson("person2")}
                className={`flex items-center gap-1.5 rounded-xl py-1.5 pl-1.5 pr-3.5 text-xs font-semibold transition-all ${
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

          {/* Date range */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Період
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCalendar(true)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                  hasDateFilter
                    ? "bg-active"
                    : "glass-pill text-foreground/55 hover:text-foreground"
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {dateLabel ?? "Обрати дати"}
              </button>
              {hasDateFilter && (
                <button
                  onClick={() => {
                    setDateRange(undefined);
                    setShowCalendar(false);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-foreground/5 text-foreground/40 transition-colors hover:bg-foreground/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <DateRangePickerModal
              open={showCalendar}
              onClose={() => setShowCalendar(false)}
              value={dateRange}
              onChange={setDateRange}
            />
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
                      ? "bg-active"
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
              person1AvatarImage={settings.person1AvatarImage}
              person2AvatarImage={settings.person2AvatarImage}
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
        closeOnOverlay={false}
        closeOnEscape={false}
        maxHeight="85dvh"
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
