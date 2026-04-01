"use client";

import { useState } from "react";
import {
  Save,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { useTheme } from "@/components/theme-provider";
import { Modal } from "@/components/ui/modal";
import * as api from "@/lib/api-client";

export default function SettingsPage() {
  const { settings, updateSettings, expenses, categories, _setAll, hydrate } =
    useExpenseStore();
  const { theme, setTheme } = useTheme();
  const [showClear, setShowClear] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const [person1Name, setPerson1Name] = useState(settings.person1Name);
  const [person2Name, setPerson2Name] = useState(settings.person2Name);
  const [currency, setCurrency] = useState(settings.currency);
  const [budget, setBudget] = useState(settings.monthlyBudget);

  const handleSave = async () => {
    setSaving(true);
    updateSettings({
      person1Name,
      person2Name,
      currency,
      monthlyBudget: budget,
    });
    // Small delay for visual feedback
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
  };

  const handleExport = async () => {
    try {
      const data = await api.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "budget-for-two-backup.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Помилка експорту даних");
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setImporting(true);
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.expenses && data.categories && data.settings) {
          await api.importAllData({
            expenses: data.expenses,
            categories: data.categories,
            settings: data.settings,
          });
          // Re-hydrate store from MongoDB
          _setAll({
            expenses: data.expenses,
            categories: data.categories,
            settings: data.settings,
          });
          // Also re-fetch to get proper MongoDB IDs
          await hydrate();
          window.location.reload();
        }
      } catch {
        alert("Помилка читання файлу");
      } finally {
        setImporting(false);
      }
    };
    input.click();
  };

  const handleClearAll = async () => {
    try {
      await api.clearAllData();
      window.location.reload();
    } catch {
      alert("Помилка очищення даних");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Настройки
        </h1>
        <p className="mt-1 text-sm text-foreground/50">
          Персонализация и управление данными
        </p>
      </div>

      {/* Profile settings */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="mb-4 text-base font-semibold">Профили</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Имя партнёра 1
            </label>
            <input
              type="text"
              value={person1Name}
              onChange={(e) => setPerson1Name(e.target.value)}
              className="input-glass w-full"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Имя партнёра 2
            </label>
            <input
              type="text"
              value={person2Name}
              onChange={(e) => setPerson2Name(e.target.value)}
              className="input-glass w-full"
            />
          </div>
        </div>
      </div>

      {/* Budget settings */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="mb-4 text-base font-semibold">Бюджет</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Валюта
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input-glass w-full"
            >
              <option value="$">$ Доллар</option>
              <option value="€">€ Евро</option>
              <option value="£">£ Фунт</option>
              <option value="¥">¥ Йена</option>
              <option value="₸">₸ Тенге</option>
              <option value="₴">₴ Гривна</option>
              <option value="zł">zł Злотый</option>
              <option value="₺">₺ Лира</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Месячный бюджет
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
              className="input-glass w-full"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="mb-4 text-base font-semibold">Тема оформления</h2>
        <div className="flex gap-3">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                theme === t
                  ? "bg-emerald-500/15 text-emerald-600 ring-2 ring-emerald-500/30 dark:text-emerald-400"
                  : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
              }`}
            >
              {t === "light"
                ? "☀️ Светлая"
                : t === "dark"
                  ? "🌙 Тёмная"
                  : "💻 Системная"}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} className="btn-primary" disabled={saving}>
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? "Зберігається…" : "Зберегти налаштування"}
      </button>

      {/* Data management */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="mb-4 text-base font-semibold">Управление данными</h2>
        <p className="mb-4 text-sm text-foreground/50">
          Всего: {expenses.length} расходов, {categories.length} категорий
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport} className="btn-secondary">
            <Download className="h-4 w-4" />
            Экспорт JSON
          </button>
          <button onClick={handleImport} className="btn-secondary">
            <Upload className="h-4 w-4" />
            Импорт JSON
          </button>
          <button
            onClick={() => setShowClear(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-5 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
            Очистить всё
          </button>
        </div>
      </div>

      {/* Clear confirmation modal */}
      <Modal
        open={showClear}
        onClose={() => setShowClear(false)}
        title="Очистить все данные?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-rose-500/10 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
            <p className="text-sm text-foreground/70">
              Это действие удалит все расходы, пользовательские категории и
              сбросит настройки. Это нельзя отменить.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowClear(false)}
              className="btn-secondary flex-1"
            >
              Отмена
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
            >
              Удалить всё
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
