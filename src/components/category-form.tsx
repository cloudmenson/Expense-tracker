"use client";

import { useState } from "react";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { useExpenseStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DeleteIconButton } from "@/components/ui/delete-icon-button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/expense";

interface CategoryFormProps {
  category?: Category | null;
  onDone: () => void;
}

const PRESET_COLORS = [
  "#e11d48",
  "#fb923c",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#f59e0b",
  "#ef4444",
  "#64748b",
];

export function CategoryForm({ category, onDone }: CategoryFormProps) {
  const {
    addCategory,
    updateCategory,
    deleteCategory,
    expenses,
    _mutating,
  } = useExpenseStore();
  const { toast } = useToast();

  const [name, setName] = useState(category?.name ?? "");
  const [emoji, setEmoji] = useState(category?.emoji ?? "📦");
  const [color, setColor] = useState(category?.color ?? "#e11d48");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canDelete = !!category;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (_mutating) return;
    if (!name.trim()) return;

    const result = category
      ? await updateCategory(category.id, { name, emoji, color })
      : await addCategory({ name, emoji, color });

    if (!result.ok) {
      toast(result.error ?? "Помилка збереження категорії", "error");
      return;
    }

    toast(category ? "Категорію оновлено" : "Категорію створено", "success");

    onDone();
  };

  const handleDeleteRequest = () => {
    if (!category) return;
    const used = expenses.filter((e) => e.categoryId === category.id).length;
    if (used > 0) {
      toast(`Неможливо видалити: ${used} витрат у цій категорії`, "error");
      return;
    }
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!category) return;
    const result = await deleteCategory(category.id);
    if (!result.ok) {
      toast(result.error ?? "Не вдалося видалити категорію", "error");
      return;
    }
    toast("Категорію видалено", "success");
    setConfirmDelete(false);
    onDone();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset
          disabled={_mutating}
          className={cn("space-y-5", _mutating && "opacity-70")}
        >
          <div className="flex gap-3">
            <EmojiPicker value={emoji} onChange={setEmoji} />
            <Input
              type="text"
              placeholder="Назва категорії"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 text-base"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Колір
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-lg transition-all hover:scale-110",
                    color === c &&
                      "ring-2 ring-foreground/30 ring-offset-2 ring-offset-surface",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              {_mutating
                ? "Зачекайте..."
                : category
                  ? "Зберегти"
                  : "Створити категорію"}
            </Button>
            {canDelete && (
              <DeleteIconButton
                onClick={handleDeleteRequest}
                disabled={_mutating}
                label="Видалити категорію"
              />
            )}
          </div>
        </fieldset>
      </form>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Видалити категорію"
        busy={_mutating}
        description={
          category && (
            <>
              Ви впевнені, що хочете видалити категорію{" "}
              <span className="font-semibold text-foreground">
                {category.emoji} {category.name}
              </span>
              ?
            </>
          )
        }
      />
    </>
  );
}
