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
import { useToast } from "@/components/ui/toast";
import * as api from "@/lib/api-client";

const PRESET_COLORS = [
  "#22c55e",
  "#84cc16",
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
  "#ef4444",
  "#64748b",
];

export default function SettingsPage() {
  const { settings, updateSettings, expenses, categories, _setAll, hydrate } =
    useExpenseStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [showClear, setShowClear] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const [person1Name, setPerson1Name] = useState(settings.person1Name);
  const [person2Name, setPerson2Name] = useState(settings.person2Name);
  const [person1Color, setPerson1Color] = useState(
    settings.person1Color ?? "#22c55e",
  );
  const [person2Color, setPerson2Color] = useState(
    settings.person2Color ?? "#3b82f6",
  );
  const [currency, setCurrency] = useState(settings.currency);
  const [budget, setBudget] = useState(settings.monthlyBudget);

  const handleSave = async () => {
    setSaving(true);
    try {
      updateSettings({
        person1Name,
        person2Name,
        currency,
        monthlyBudget: budget,
        person1Color,
        person2Color,
      });
      await new Promise((r) => setTimeout(r, 300));
      toast("Налаштування збережено", "success");
    } finally {
      setSaving(false);
    }
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
      toast("Дані експортовано", "success");
    } catch {
      toast("Помилка експорту даних", "error");
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
          toast("Дані імпортовано", "success");
          setTimeout(() => window.location.reload(), 800);
        }
      } catch {
        toast("Помилка читання файлу", "error");
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
      toast("Помилка очищення даних", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Налаштування
        </h1>
        <p className="mt-1 text-sm text-foreground/50">
          Персоналізація та керування даними
        </p>
      </div>

      {/* Profile settings */}
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">Профілі</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Person 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 shrink-0 rounded-xl"
                style={{ backgroundColor: person1Color }}
              />
              <input
                type="text"
                placeholder="Ім'я партнера 1"
                value={person1Name}
                onChange={(e) => setPerson1Name(e.target.value)}
                className="input-glass flex-1"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
                Колір
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPerson1Color(c)}
                    className={`h-7 w-7 rounded-lg transition-all hover:scale-110 ${
                      person1Color === c
                        ? "ring-2 ring-foreground/30 ring-offset-2 ring-offset-surface"
                        : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Person 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 shrink-0 rounded-xl"
                style={{ backgroundColor: person2Color }}
              />
              <input
                type="text"
                placeholder="Ім'я партнера 2"
                value={person2Name}
                onChange={(e) => setPerson2Name(e.target.value)}
                className="input-glass flex-1"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
                Колір
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPerson2Color(c)}
                    className={`h-7 w-7 rounded-lg transition-all hover:scale-110 ${
                      person2Color === c
                        ? "ring-2 ring-foreground/30 ring-offset-2 ring-offset-surface"
                        : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget settings */}
      <div className="glass-card rounded-2xl p-4 sm:p-6">
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
              <option value="$">$ Долар</option>
              <option value="€">€ Євро</option>
              <option value="₴">₴ Гривня</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Місячний бюджет
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
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">Тема оформлення</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`rounded-xl px-2 py-3 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                theme === t
                  ? "bg-emerald-500/15 text-emerald-600 ring-2 ring-emerald-500/30 dark:text-emerald-400"
                  : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
              }`}
            >
              {t === "light" ? "☀️ Світла" : "🌙 Темна"}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="btn-primary w-full sm:w-auto"
        disabled={saving}
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? "Зберігається…" : "Зберегти налаштування"}
      </button>

      {/* Data management */}
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">Керування даними</h2>
        <p className="mb-4 text-sm text-foreground/50">
          Всього: {expenses.length} витрат, {categories.length} категорій
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            onClick={handleExport}
            className="btn-secondary w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Експорт JSON
          </button>
          <button
            onClick={handleImport}
            className="btn-secondary w-full sm:w-auto"
            disabled={importing}
          >
            <Upload className="h-4 w-4" />
            Імпорт JSON
          </button>
          <button
            onClick={() => setShowClear(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-5 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-500/10 sm:w-auto dark:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
            Очистити все
          </button>
        </div>
      </div>

      {/* Clear confirmation modal */}
      <Modal
        open={showClear}
        onClose={() => setShowClear(false)}
        title="Очистити всі дані?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-rose-500/10 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
            <p className="text-sm text-foreground/70">
              Ця дія видалить усі витрати, користувацькі категорії та скине
              налаштування. Це неможливо скасувати.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowClear(false)}
              className="btn-secondary flex-1"
            >
              Скасувати
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
            >
              Видалити все
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
