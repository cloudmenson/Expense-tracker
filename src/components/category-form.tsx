"use client";

import { useState } from "react";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { useExpenseStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
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
  const { addCategory, updateCategory } = useExpenseStore();
  const { toast } = useToast();

  const [name, setName] = useState(category?.name ?? "");
  const [emoji, setEmoji] = useState(category?.emoji ?? "📦");
  const [color, setColor] = useState(category?.color ?? "#e11d48");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
              className={`h-8 w-8 rounded-lg transition-all hover:scale-110 ${
                color === c
                  ? "ring-2 ring-foreground/30 ring-offset-2 ring-offset-surface"
                  : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        {category ? "Зберегти" : "Створити категорію"}
      </Button>
    </form>
  );
}
