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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import * as api from "@/lib/api-client";

export default function SettingsPage() {
  const { settings, updateSettings, expenses, categories, _setAll, hydrate } =
    useExpenseStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [showClear, setShowClear] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const [currency, setCurrency] = useState(settings.currency);

  const handleSave = async () => {
    setSaving(true);
    try {
      updateSettings({
        currency,
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

      {/* General settings */}
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">Загальні</h2>
        <div className="grid gap-4 sm:grid-cols-1">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/40">
              Валюта
            </label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$">$ Долар</SelectItem>
                <SelectItem value="€">€ Євро</SelectItem>
                <SelectItem value="₴">₴ Гривня</SelectItem>
              </SelectContent>
            </Select>
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
                  ? "bg-rose-500/15 text-rose-600 ring-2 ring-rose-500/30 dark:text-pink-400"
                  : "bg-foreground/5 text-foreground/50 hover:bg-foreground/10"
              }`}
            >
              {t === "light" ? "☀️ Світла" : "🌙 Темна"}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <Button
        onClick={handleSave}
        className="w-full sm:w-auto"
        disabled={saving}
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? "Зберігається…" : "Зберегти налаштування"}
      </Button>

      {/* Data management */}
      <div className="glass-card rounded-2xl p-4 sm:p-6">
        <h2 className="mb-4 text-base font-semibold">Керування даними</h2>
        <p className="mb-4 text-sm text-foreground/50">
          Всього: {expenses.length} витрат, {categories.length} категорій
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            variant="secondary"
            onClick={handleExport}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Експорт JSON
          </Button>
          <Button
            variant="secondary"
            onClick={handleImport}
            className="w-full sm:w-auto"
            disabled={importing}
          >
            <Upload className="h-4 w-4" />
            Імпорт JSON
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowClear(true)}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4" />
            Очистити все
          </Button>
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
            <Button
              variant="secondary"
              onClick={() => setShowClear(false)}
              className="flex-1"
            >
              Скасувати
            </Button>
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
