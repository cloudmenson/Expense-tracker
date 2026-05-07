"use client";

import { useState, useMemo, useRef } from "react";
import {
  Plus,
  ShoppingCart,
  ShoppingBag,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import { DeleteIconButton } from "@/components/ui/delete-icon-button";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { useExpenseStore } from "@/lib/store";
import { PersonAvatar } from "@/components/person-avatar";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { Modal } from "@/components/ui/modal";
import { DatePickerModal } from "@/components/ui/date-picker-modal";
import { CategoryForm } from "@/components/category-form";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, todayISO } from "@/lib/utils";
import type { ExpenseDraft, Expense, ExpenseItem } from "@/types/expense";

interface ExpenseFormProps {
  expense?: Expense | null;
  defaultCategoryId?: string;
  onDone: () => void;
}

function buildInitial(
  expense: Expense | null | undefined,
  fallbackCatId: string,
): ExpenseDraft {
  if (expense) {
    return {
      title: expense.title,
      amount: expense.amount,
      categoryId: expense.categoryId,
      paidBy: expense.paidBy,
      date: expense.date,
      note: expense.note ?? "",
      emoji: expense.emoji ?? "",
      items: expense.items ?? [],
    };
  }
  return {
    title: "",
    amount: 0,
    categoryId: fallbackCatId,
    paidBy: "",
    date: todayISO(),
    note: "",
    emoji: "",
    items: [],
  };
}

export function ExpenseForm({
  expense,
  defaultCategoryId,
  onDone,
}: ExpenseFormProps) {
  const { categories, settings, addExpense, updateExpense, _mutating } =
    useExpenseStore();
  const { toast } = useToast();

  const initialData = useMemo(
    () =>
      buildInitial(expense, defaultCategoryId ?? categories[0]?.id ?? "other"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expense?.id, defaultCategoryId],
  );

  const [form, setForm] = useState<ExpenseDraft>(initialData);
  const [isList, setIsList] = useState(
    () => (initialData.items?.length ?? 0) > 0,
  );
  const [items, setItems] = useState<ExpenseItem[]>(() =>
    initialData.items?.length ? initialData.items : [{ name: "", price: 0 }],
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const set = <K extends keyof ExpenseDraft>(key: K, val: ExpenseDraft[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const listTotal = items.reduce((s, i) => s + (i.price || 0), 0);

  const addItem = () => setItems((p) => [...p, { name: "", price: 0 }]);
  const removeItem = (idx: number) =>
    setItems((p) => p.filter((_, i) => i !== idx));
  const updateItem = (
    idx: number,
    field: keyof ExpenseItem,
    val: string | number,
  ) =>
    setItems((p) =>
      p.map((item, i) => (i === idx ? { ...item, [field]: val } : item)),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (_mutating) return;

    if (!form.paidBy) {
      toast("Оберіть хто платив", "error");
      return;
    }

    if (isList) {
      const valid = items.filter((i) => i.name.trim() && i.price > 0);
      if (!form.title.trim() || valid.length === 0) return;
      const total = valid.reduce((s, i) => s + i.price, 0);
      const draft: ExpenseDraft = { ...form, amount: total, items: valid };
      const result = expense
        ? await updateExpense(expense.id, draft)
        : await addExpense(draft);

      if (!result.ok) {
        toast(result.error ?? "Помилка збереження витрати", "error");
        return;
      }
    } else {
      if (!form.title.trim() || form.amount <= 0) return;
      const draft: ExpenseDraft = { ...form, items: [] };
      const result = expense
        ? await updateExpense(expense.id, draft)
        : await addExpense(draft);

      if (!result.ok) {
        toast(result.error ?? "Помилка збереження витрати", "error");
        return;
      }
    }

    toast(expense ? "Витрату оновлено" : "Витрату створено", "success");
    onDone();
  };

  const selectedCat = categories.find((c) => c.id === form.categoryId);

  // Long-press on category button → open category editor
  const [editingCat, setEditingCat] = useState<
    (typeof categories)[number] | null
  >(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longFired = useRef(false);

  const onCatPressStart = (cat: (typeof categories)[number]) => {
    longFired.current = false;
    pressTimer.current = setTimeout(() => {
      longFired.current = true;
      setEditingCat(cat);
    }, 500);
  };
  const onCatPressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset
          disabled={_mutating}
          className={cn("space-y-5", _mutating && "opacity-70")}
        >
          {/* Mode toggle */}
          {!expense && (
            <div className="glass-pill flex gap-1 rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => setIsList(false)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold",
                  !isList
                    ? "bg-active"
                    : "text-foreground/55 hover:text-foreground",
                )}
              >
                <ShoppingBag className="h-4 w-4" />
                Один товар
              </button>
              <button
                type="button"
                onClick={() => setIsList(true)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold",
                  isList
                    ? "bg-active"
                    : "text-foreground/55 hover:text-foreground",
                )}
              >
                <ShoppingCart className="h-4 w-4" />
                Список покупок
              </button>
            </div>
          )}

          {/* Emoji + Title */}
          <div className="flex gap-3">
            <EmojiPicker
              value={form.emoji || selectedCat?.emoji}
              onChange={(e) => set("emoji", e)}
            />
            <div className="flex-1">
              <Input
                type="text"
                placeholder={
                  isList ? "Назва магазину / події" : "Назва витрати"
                }
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="text-base"
              />
            </div>
          </div>

          {/* LIST MODE: items */}
          {isList ? (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/40">
                Товари ({items.length}) · Разом:{" "}
                <span style={{ color: "var(--brand-deep)" }}>
                  {settings.currency} {listTotal.toLocaleString("en-US")}
                </span>
              </label>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Назва товару"
                      value={item.name}
                      onChange={(e) => updateItem(i, "name", e.target.value)}
                      className="flex-1 text-sm"
                    />
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={item.price || ""}
                      onChange={(e) =>
                        updateItem(i, "price", parseFloat(e.target.value) || 0)
                      }
                      className="w-24 text-sm"
                      min={0}
                      step={0.01}
                    />
                    <DeleteIconButton
                      variant="soft"
                      onClick={() => removeItem(i)}
                      className="h-10 w-10"
                      label="Видалити товар"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--brand-deep)" }}
              >
                <Plus className="h-4 w-4" />
                Додати товар
              </button>
            </div>
          ) : (
            /* SIMPLE MODE: amount */
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
                Сума ({settings.currency})
              </label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={form.amount || ""}
                onChange={(e) => set("amount", parseFloat(e.target.value) || 0)}
                className="text-2xl font-semibold"
                min={0}
                step={0.01}
              />
            </div>
          )}

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Категорія
            </label>
            <div className="no-select-callout grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={() => {
                    if (!longFired.current) set("categoryId", cat.id);
                  }}
                  onPointerDown={() => onCatPressStart(cat)}
                  onPointerUp={onCatPressEnd}
                  onPointerLeave={onCatPressEnd}
                  onPointerCancel={onCatPressEnd}
                  className={cn(
                    "no-select-callout group relative flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-center transition-all hover:scale-105 active:scale-95",
                    form.categoryId === cat.id
                      ? "glass-card ring-2 ring-brand/35"
                      : "glass-pill hover:bg-foreground/4",
                  )}
                >
                  <span className="text-xl transition-transform group-hover:animate-emoji-bounce">
                    {cat.emoji}
                  </span>
                  <span className="text-[10px] font-medium leading-tight text-foreground/60">
                    {cat.name}
                  </span>
                </button>
              ))}

              <button
                type="button"
                onContextMenu={(e) => e.preventDefault()}
                onClick={() => setShowCreateCategory(true)}
                className="no-select-callout group relative flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-2 text-center transition-all hover:scale-105 active:scale-95"
                style={{
                  borderColor: "color-mix(in srgb, var(--brand) 38%, transparent)",
                  backgroundColor: "var(--brand-soft)",
                }}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-md text-white shadow-sm transition-transform group-hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--brand-strong) 0%, var(--brand) 60%, var(--brand-deep) 100%)",
                  }}
                >
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            </div>
          </div>

          {/* Date + Paid by */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
                Дата
              </label>
              <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className="input-glass flex w-full items-center gap-2 text-left"
              >
                <CalendarDays className="h-4 w-4 shrink-0 field-icon" />
                <span className="flex-1 text-sm">
                  {format(parseISO(form.date), "d MMMM yyyy", { locale: uk })}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
                    showDatePicker && "rotate-180",
                  )}
                />
              </button>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
                Хто платив
              </label>
              <div className="flex gap-2">
                {(["person1", "person2"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set("paidBy", p)}
                    className={cn(
                      "flex min-h-12 flex-1 items-center justify-center rounded-xl px-3 text-sm font-medium",
                      form.paidBy === p
                        ? "bg-active"
                        : "glass-pill text-foreground/60 hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <PersonAvatar
                        name={
                          p === "person1"
                            ? settings.person1Name
                            : settings.person2Name
                        }
                        color={
                          p === "person1"
                            ? settings.person1Color
                            : settings.person2Color
                        }
                        avatarImage={
                          p === "person1"
                            ? settings.person1AvatarImage
                            : settings.person2AvatarImage
                        }
                        size="xs"
                      />
                      {p === "person1"
                        ? settings.person1Name
                        : settings.person2Name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Нотатка
            </label>
            <Textarea
              placeholder="Необов'язковий коментар..."
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              rows={2}
            />
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full">
            {_mutating
              ? "Зачекайте..."
              : expense
                ? "Зберегти зміни"
                : "Додати витрату"}
          </Button>
        </fieldset>
      </form>

      {/* Long-press: category editor */}
      <Modal
        open={!!editingCat}
        onClose={() => setEditingCat(null)}
        title="Редагувати категорію"
        size="sm"
        tall
      >
        <CategoryForm
          category={editingCat}
          onDone={() => setEditingCat(null)}
        />
      </Modal>

      <Modal
        open={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        title="Нова категорія"
        size="sm"
        tall
      >
        <CategoryForm onDone={() => setShowCreateCategory(false)} />
      </Modal>

      <DatePickerModal
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        value={form.date}
        onChange={(iso) => set("date", iso)}
      />
    </>
  );
}
