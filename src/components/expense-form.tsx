"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, ShoppingCart, ShoppingBag } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { useToast } from "@/components/ui/toast";
import { todayISO } from "@/lib/utils";
import type { ExpenseDraft, Expense, ExpenseItem } from "@/types/expense";

interface ExpenseFormProps {
  expense?: Expense | null;
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

export function ExpenseForm({ expense, onDone }: ExpenseFormProps) {
  const { categories, settings, addExpense, updateExpense } = useExpenseStore();
  const { toast } = useToast();

  const initialData = useMemo(
    () => buildInitial(expense, categories[0]?.id ?? "other"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expense?.id],
  );

  const [form, setForm] = useState<ExpenseDraft>(initialData);
  const [isList, setIsList] = useState(
    () => (initialData.items?.length ?? 0) > 0,
  );
  const [items, setItems] = useState<ExpenseItem[]>(() =>
    initialData.items?.length ? initialData.items : [{ name: "", price: 0 }],
  );

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.paidBy) {
      toast("Оберіть хто платив", "error");
      return;
    }

    if (isList) {
      const valid = items.filter((i) => i.name.trim() && i.price > 0);
      if (!form.title.trim() || valid.length === 0) return;
      const total = valid.reduce((s, i) => s + i.price, 0);
      const draft: ExpenseDraft = { ...form, amount: total, items: valid };
      expense ? updateExpense(expense.id, draft) : addExpense(draft);
    } else {
      if (!form.title.trim() || form.amount <= 0) return;
      const draft: ExpenseDraft = { ...form, items: [] };
      expense ? updateExpense(expense.id, draft) : addExpense(draft);
    }
    onDone();
  };

  const selectedCat = categories.find((c) => c.id === form.categoryId);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mode toggle */}
      {!expense && (
        <div className="flex gap-1 rounded-xl bg-foreground/5 p-1">
          <button
            type="button"
            onClick={() => setIsList(false)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              !isList
                ? "bg-surface text-foreground shadow-sm"
                : "text-foreground/50 hover:text-foreground"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Один товар
          </button>
          <button
            type="button"
            onClick={() => setIsList(true)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              isList
                ? "bg-surface text-foreground shadow-sm"
                : "text-foreground/50 hover:text-foreground"
            }`}
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
          <input
            type="text"
            placeholder={isList ? "Назва магазину / події" : "Назва витрати"}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="input-glass w-full text-base"
          />
        </div>
      </div>

      {/* LIST MODE: items */}
      {isList ? (
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/40">
            Товари ({items.length}) · Разом:{" "}
            <span className="text-rose-600 dark:text-pink-400">
              {settings.currency} {listTotal.toLocaleString("en-US")}
            </span>
          </label>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Назва товару"
                  value={item.name}
                  onChange={(e) => updateItem(i, "name", e.target.value)}
                  className="input-glass flex-1 text-sm"
                />
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={item.price || ""}
                  onChange={(e) =>
                    updateItem(i, "price", parseFloat(e.target.value) || 0)
                  }
                  className="input-glass w-24 text-sm"
                  min={0}
                  step={0.01}
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-foreground/30 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-2 text-sm font-medium text-rose-600 transition-colors hover:text-rose-500 dark:text-pink-400 dark:hover:text-pink-300"
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
          <input
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={form.amount || ""}
            onChange={(e) => set("amount", parseFloat(e.target.value) || 0)}
            className="input-glass w-full text-2xl font-semibold"
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
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => set("categoryId", cat.id)}
              className={`group relative flex flex-col items-center gap-1 rounded-xl p-2 text-center transition-all hover:scale-110 active:scale-95 ${
                form.categoryId === cat.id
                  ? "bg-rose-500/20 ring-2 ring-rose-500/40"
                  : "bg-foreground/5 hover:bg-foreground/10"
              }`}
            >
              <span className="text-xl transition-transform group-hover:animate-emoji-bounce">
                {cat.emoji}
              </span>
              <span className="text-[10px] font-medium leading-tight text-foreground/60">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Date + Paid by */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
            Дата
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="input-glass w-full min-w-0"
          />
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
                className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  form.paidBy === p
                    ? "bg-rose-500/15 text-rose-600 ring-2 ring-rose-500/40 dark:text-pink-400"
                    : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                }`}
              >
                {p === "person1" ? settings.person1Name : settings.person2Name}
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
        <textarea
          placeholder="Необов'язковий коментар..."
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
          rows={2}
          className="input-glass w-full resize-none"
        />
      </div>

      {/* Submit */}
      <button type="submit" className="btn-primary w-full">
        {expense ? "Зберегти зміни" : "Додати витрату"}
      </button>
    </form>
  );
}
