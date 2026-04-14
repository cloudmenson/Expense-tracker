"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { CategoryForm } from "@/components/category-form";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import type { Category } from "@/types/expense";

export default function CategoriesPage() {
  const { categories, expenses, deleteCategory, _hydrated } = useExpenseStore();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

  const getCatCount = (catId: string) =>
    expenses.filter((e) => e.categoryId === catId).length;
  const getCatTotal = (catId: string) =>
    expenses
      .filter((e) => e.categoryId === catId)
      .reduce((s, e) => s + e.amount, 0);

  const handleDelete = (cat: Category) => {
    if (getCatCount(cat.id) > 0) {
      toast(
        `Неможливо видалити: ${getCatCount(cat.id)} витрат у цій категорії`,
        "error",
      );
      return;
    }
    setCategoryToDelete(cat);
  };

  if (!_hydrated) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-36 animate-pulse rounded-xl bg-foreground/8" />
            <div className="h-4 w-24 animate-pulse rounded-lg bg-foreground/5" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded-xl bg-foreground/8" />
        </div>
        {/* Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="glass-card flex items-center gap-4 rounded-2xl p-4"
            >
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-foreground/8" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded-lg bg-foreground/8" />
                <div className="h-3 w-20 animate-pulse rounded-lg bg-foreground/5" />
              </div>
              <div className="h-6 w-1.5 animate-pulse rounded-full bg-foreground/8" />
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
            Категорії
          </h1>
          <p className="mt-1 text-sm text-foreground/50">
            {categories.length} категорій
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Нова категорія
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const count = getCatCount(cat.id);
          const total = getCatTotal(cat.id);
          return (
            <div
              key={cat.id}
              className="glass-card group relative flex items-center gap-4 rounded-2xl p-4 transition-all hover:scale-[1.01] hover:shadow-md"
            >
              {/* Emoji */}
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: cat.color + "18" }}
              >
                {cat.emoji}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold">{cat.name}</p>
                  {cat.isCustom && (
                    <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Своя
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-foreground/40">
                  {count} витрат · {total.toLocaleString("en-US")}
                </p>
              </div>

              {/* Color indicator */}
              <div
                className="h-6 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: cat.color }}
              />

              {/* Actions — always visible on mobile */}
              <div className="flex shrink-0 gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                <button
                  onClick={() => {
                    setEditing(cat);
                    setShowForm(true);
                  }}
                  className="flex h-9 w-9 touch-manipulation items-center justify-center rounded-xl text-foreground/30 transition-colors hover:bg-foreground/10 hover:text-foreground active:bg-foreground/10"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {cat.isCustom && (
                  <button
                    onClick={() => handleDelete(cat)}
                    className="flex h-9 w-9 touch-manipulation items-center justify-center rounded-xl text-foreground/30 transition-colors hover:bg-rose-500/10 hover:text-rose-500 active:bg-rose-500/10 active:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Редагувати категорію" : "Нова категорія"}
        size="sm"
        tall
      >
        <CategoryForm category={editing} onDone={() => setShowForm(false)} />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        title="Видалити категорію"
        size="sm"
      >
        <p className="mb-6 text-sm text-foreground/60">
          Ви впевнені, що хочете видалити категорію{" "}
          <span className="font-semibold text-foreground">
            {categoryToDelete?.emoji} {categoryToDelete?.name}
          </span>
          ?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setCategoryToDelete(null)}
            className="rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/10"
          >
            Скасувати
          </button>
          <button
            onClick={async () => {
              if (!categoryToDelete) return;
              const result = await deleteCategory(categoryToDelete.id);
              toast(
                result.ok
                  ? "Категорію видалено"
                  : (result.error ?? "Не вдалося видалити категорію"),
                result.ok ? "success" : "error",
              );
              if (result.ok) setCategoryToDelete(null);
            }}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
          >
            Видалити
          </button>
        </div>
      </Modal>
    </div>
  );
}
