"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarCheck } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MonthPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Currently selected month in "YYYY-MM" format. */
  value?: string;
  onConfirm: (month: string) => void | Promise<void>;
  title?: string;
  /** Months that are already taken — they appear disabled. */
  disabledMonths?: string[];
  /** Limit how far back/forward a user can navigate. Defaults: -10 years from now, +1 year. */
  minYear?: number;
  maxYear?: number;
}

const MONTH_LABELS = [
  "Січ",
  "Лют",
  "Бер",
  "Кві",
  "Тра",
  "Чер",
  "Лип",
  "Сер",
  "Вер",
  "Жов",
  "Лис",
  "Гру",
];

const fmt = (year: number, month1: number) =>
  `${year}-${String(month1).padStart(2, "0")}`;

export function MonthPickerModal({
  open,
  onClose,
  value,
  onConfirm,
  title = "Оберіть місяць",
  disabledMonths = [],
  minYear,
  maxYear,
}: MonthPickerModalProps) {
  const now = new Date();
  const initialYear = value
    ? parseInt(value.split("-")[0], 10)
    : now.getFullYear();
  const initialMonth = value ? parseInt(value.split("-")[1], 10) : null;

  const [year, setYear] = useState(initialYear);
  const [pickedMonth, setPickedMonth] = useState<string | null>(
    value ?? null,
  );
  const [busy, setBusy] = useState(false);

  const minY = minYear ?? now.getFullYear() - 10;
  const maxY = maxYear ?? now.getFullYear() + 1;

  const disabledSet = useMemo(
    () => new Set(disabledMonths),
    [disabledMonths],
  );

  const handleConfirm = async () => {
    if (!pickedMonth) return;
    setBusy(true);
    try {
      await onConfirm(pickedMonth);
    } finally {
      setBusy(false);
    }
  };

  const currentMonthKey = fmt(now.getFullYear(), now.getMonth() + 1);
  const todayDisabled = disabledSet.has(currentMonthKey);
  const pickToday = () => {
    if (todayDisabled) return;
    setYear(now.getFullYear());
    setPickedMonth(currentMonthKey);
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      {/* Year navigator */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => year > minY && setYear((y) => y - 1)}
          disabled={year <= minY}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-brand-soft hover:text-brand-deep disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-base font-bold tabular-nums">{year}</div>
        <button
          type="button"
          onClick={() => year < maxY && setYear((y) => y + 1)}
          disabled={year >= maxY}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-brand-soft hover:text-brand-deep disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-3 gap-2">
        {MONTH_LABELS.map((label, i) => {
          const m = i + 1;
          const key = fmt(year, m);
          const selected = pickedMonth === key;
          const disabled = disabledSet.has(key);
          const isCurrent =
            year === now.getFullYear() && m === now.getMonth() + 1;
          return (
            <button
              key={key}
              type="button"
              onClick={() => !disabled && setPickedMonth(key)}
              disabled={disabled}
              className={cn(
                "flex h-12 items-center justify-center rounded-xl text-sm font-semibold transition-colors",
                selected
                  ? "glass-card text-brand-deep ring-2 ring-brand/35"
                  : disabled
                    ? "bg-foreground/5 text-foreground/25"
                    : "glass-pill text-foreground/70 hover:bg-foreground/4",
              )}
            >
              <span>{label}</span>
              {isCurrent && !selected && (
                <span
                  className="ml-1 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "var(--brand)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="secondary"
        className="mt-4 w-full"
        onClick={pickToday}
        disabled={busy || todayDisabled}
      >
        <CalendarCheck className="h-4 w-4" />
        Поточний місяць
      </Button>

      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onClose}
          disabled={busy}
        >
          Скасувати
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={() => void handleConfirm()}
          disabled={!pickedMonth || busy || disabledSet.has(pickedMonth ?? "")}
        >
          {busy ? "Створення…" : value ? "Зберегти" : "Створити"}
        </Button>
      </div>
    </Modal>
  );
}
