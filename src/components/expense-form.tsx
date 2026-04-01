"use client";

import { useState, useMemo } from "react";
import { useExpenseStore } from "@/lib/store";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { todayISO } from "@/lib/utils";
import type { ExpenseDraft, Expense } from "@/types/expense";

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
    };
  }
  return {
    title: "",
    amount: 0,
    categoryId: fallbackCatId,
    paidBy: "person1",
    date: todayISO(),
    note: "",
    emoji: "",
  };
}

export function ExpenseForm({ expense, onDone }: ExpenseFormProps) {
  const { categories, settings, addExpense, updateExpense } = useExpenseStore();

  const initialData = useMemo(
    () => buildInitial(expense, categories[0]?.id ?? "other"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expense?.id],
  );

  const [form, setForm] = useState<ExpenseDraft>(initialData);

  const set = <K extends keyof ExpenseDraft>(key: K, val: ExpenseDraft[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || form.amount <= 0) return;

    if (expense) {
      updateExpense(expense.id, form);
    } else {
      addExpense(form);
    }
    onDone();
  };

  const selectedCat = categories.find((c) => c.id === form.categoryId);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Emoji + Title */}
      <div className="flex gap-3">
        <EmojiPicker
          value={form.emoji || selectedCat?.emoji}
          onChange={(e) => set("emoji", e)}
        />
        <div className="flex-1">
          <input
            type="text"
            placeholder="Название расхода"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="input-glass w-full text-base"
            autoFocus
          />
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
          Сумма ({settings.currency})
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

      {/* Category */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
          Категория
        </label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => set("categoryId", cat.id)}
              className={`flex flex-col items-center gap-1 rounded-xl p-2 text-center transition-all hover:scale-105 ${
                form.categoryId === cat.id
                  ? "bg-emerald-500/15 ring-2 ring-emerald-500/40"
                  : "bg-foreground/5 hover:bg-foreground/10"
              }`}
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="text-[10px] font-medium leading-tight text-foreground/60">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Date + Paid by */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
            Дата
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="input-glass w-full"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
            Оплатил(а)
          </label>
          <div className="flex gap-2">
            {(["person1", "person2"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => set("paidBy", p)}
                className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  form.paidBy === p
                    ? "bg-emerald-500/15 text-emerald-600 ring-2 ring-emerald-500/40 dark:text-emerald-400"
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
          Заметка
        </label>
        <textarea
          placeholder="Необязательный комментарий..."
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
          rows={2}
          className="input-glass w-full resize-none"
        />
      </div>

      {/* Submit */}
      <button type="submit" className="btn-primary w-full">
        {expense ? "Сохранить изменения" : "Добавить расход"}
      </button>
    </form>
  );
}
