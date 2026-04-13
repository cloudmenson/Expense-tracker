"use client";

import { useEffect, useState } from "react";
import { Trash2, RotateCcw, X, AlertTriangle } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/utils";
import type { TrashItem } from "@/types/expense";
import type { Expense, Category } from "@/types/expense";

function daysLeft(deletedAt: string): number {
  const deleted = new Date(deletedAt).getTime();
  const expires = deleted + 7 * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((expires - Date.now()) / (24 * 60 * 60 * 1000)));
}

export default function TrashPage() {
  const {
    trashItems,
    fetchTrash,
    restoreFromTrash,
    deleteFromTrash,
    clearTrash,
    settings,
  } = useExpenseStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<TrashItem | null>(null);

  useEffect(() => {
    fetchTrash().finally(() => setLoading(false));
  }, [fetchTrash]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Кошик</h1>
          <p className="mt-1 text-sm text-foreground/50">
            Видалені елементи зберігаються 7 днів
          </p>
        </div>
        {trashItems.length > 0 && (
          <button
            onClick={() => setConfirmClear(true)}
            className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/20"
          >
            <Trash2 className="h-4 w-4" />
            Очистити все
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      ) : trashItems.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="Кошик порожній"
          description="Видалені витрати та категорії з'являться тут"
        />
      ) : (
        <div className="space-y-2">
          {trashItems.map((item) => {
            const days = daysLeft(item.deletedAt);
            const isExpense = item.type === "expense";
            const data = item.data as Expense & Category;

            return (
              <div
                key={item.id}
                className="glass-card flex items-center gap-3 rounded-2xl p-3 sm:p-4"
              >
                {/* Icon / emoji */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                  style={{
                    backgroundColor: isExpense
                      ? "rgba(148,163,184,0.12)"
                      : (data.color ?? "#94a3b8") + "18",
                  }}
                >
                  {data.emoji || (isExpense ? "📦" : "🗂️")}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {data.name ?? data.title}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/40">
                    {isExpense
                      ? formatMoney(data.amount, settings.currency)
                      : "Категорія"}
                    {" · "}
                    <span
                      className={
                        days <= 1 ? "text-rose-500" : "text-foreground/40"
                      }
                    >
                      {days === 0
                        ? "Видалиться сьогодні"
                        : `${days} ${days === 1 ? "день" : days < 5 ? "дні" : "днів"}`}
                    </span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={async () => {
                      const result = await restoreFromTrash(item.id);
                      toast(
                        result.ok
                          ? "Елемент відновлено"
                          : (result.error ?? "Не вдалося відновити елемент"),
                        result.ok ? "success" : "error",
                      );
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-brand transition-colors hover:bg-brand/10"
                    title="Відновити"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-foreground/30 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                    title="Видалити назавжди"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm clear all */}
      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Очистити кошик?"
        size="sm"
      >
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-rose-500/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
          <p className="text-sm text-foreground/70">
            Всі{" "}
            <span className="font-semibold text-foreground">
              {trashItems.length}
            </span>{" "}
            елементів будуть видалені назавжди. Цю дію не можна скасувати.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setConfirmClear(false)}
            className="rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/10"
          >
            Скасувати
          </button>
          <button
            onClick={async () => {
              const result = await clearTrash();
              toast(
                result.ok
                  ? "Кошик очищено"
                  : (result.error ?? "Не вдалося очистити кошик"),
                result.ok ? "success" : "error",
              );
              if (result.ok) setConfirmClear(false);
            }}
            className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
          >
            Очистити
          </button>
        </div>
      </Modal>

      {/* Confirm permanent delete */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Видалити назавжди?"
        size="sm"
      >
        <p className="mb-6 text-sm text-foreground/60">
          Видалити{" "}
          <span className="font-semibold text-foreground">
            {(confirmDelete?.data as Expense & Category)?.name ??
              (confirmDelete?.data as Expense)?.title}
          </span>{" "}
          назавжди? Відновити буде неможливо.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setConfirmDelete(null)}
            className="rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/10"
          >
            Скасувати
          </button>
          <button
            onClick={async () => {
              if (!confirmDelete) return;
              const result = await deleteFromTrash(confirmDelete.id);
              toast(
                result.ok
                  ? "Елемент видалено назавжди"
                  : (result.error ?? "Не вдалося видалити елемент"),
                result.ok ? "success" : "error",
              );
              if (result.ok) setConfirmDelete(null);
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
