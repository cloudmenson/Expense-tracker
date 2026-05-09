"use client";

import { useState } from "react";
import {
  Loader2,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { cn } from "@/lib/utils";
import { DeleteIconButton } from "@/components/ui/delete-icon-button";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { useRentalStore } from "@/lib/rental-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DatePickerModal } from "@/components/ui/date-picker-modal";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { ImageViewerModal } from "@/components/ui/image-viewer-modal";
import { computeMonth } from "@/lib/rental-calc";
import {
  METERED_KINDS,
  FIXED_KINDS,
  UTILITY_LABELS,
  type UtilityKind,
  type RentMonth,
  type RentReading,
} from "@/types/rental";
import { UTILITY_ICON, UTILITY_TINT } from "@/lib/utility-meta";
import { MonthExportButton } from "./month-export-button";

const monthLabel = (m: string) =>
  format(parseISO(`${m}-01`), "LLLL yyyy", { locale: uk });

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const ALL_KINDS: UtilityKind[] = [...METERED_KINDS, ...FIXED_KINDS];

interface Props {
  month: RentMonth;
  onBack: () => void;
}

export function MonthDetail({ month, onBack }: Props) {
  const { updateMonth, deleteMonth } = useRentalStore();

  const initialReadings: RentReading[] = ALL_KINDS.map((kind) => {
    const existing = month.readings.find((r) => r.kind === kind);
    return existing ?? { kind, previous: 0, current: 0, photo: "" };
  });

  const [readings, setReadings] = useState<RentReading[]>(initialReadings);
  const [rentAmount, setRentAmount] = useState(String(month.rentAmount || ""));
  const [charged, setCharged] = useState(
    month.charged ? String(month.charged) : "",
  );
  const [paid, setPaid] = useState(month.paid ? String(month.paid) : "");
  const [paidAt, setPaidAt] = useState(month.paidAt ?? "");
  const [invoicePhoto, setInvoicePhoto] = useState(month.invoicePhoto ?? "");
  const [notes, setNotes] = useState(month.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const updateReading = (kind: string, patch: Partial<RentReading>) =>
    setReadings((rs) =>
      rs.map((r) => (r.kind === kind ? { ...r, ...patch } : r)),
    );

  const totals = computeMonth({
    ...month,
    readings,
    rentAmount: parseFloat(rentAmount) || 0,
    charged: parseFloat(charged) || 0,
    paid: parseFloat(paid) || 0,
  });

  const onSave = async () => {
    setSaving(true);
    try {
      await updateMonth(month.id, {
        readings,
        rentAmount: parseFloat(rentAmount) || 0,
        charged: parseFloat(charged) || 0,
        paid: parseFloat(paid) || 0,
        paidAt,
        invoicePhoto,
        notes,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <BackButton onClick={onBack} />
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            {capitalize(monthLabel(month.month))}
          </h1>
        </div>
        <MonthExportButton month={month} />
      </div>

      {/* Summary card */}
      <div className="glass-card rounded-2xl p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/45">
          {monthLabel(month.month)}
        </p>
        <div className="mt-1 flex items-baseline gap-3">
          <p
            className="text-3xl font-black tabular-nums sm:text-[2.5rem]"
            style={{ color: "var(--brand-deep)" }}
          >
            {totals.total.toLocaleString("uk-UA", {
              maximumFractionDigits: 0,
            })}{" "}
            ₴
          </p>
          <span className="text-xs text-foreground/45">до сплати</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="glass-pill rounded-xl px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
              Квартплата
            </p>
            <p className="mt-0.5 text-base font-bold tabular-nums">
              {totals.rentAmount.toLocaleString("uk-UA")} ₴
            </p>
          </div>
          <div className="glass-pill rounded-xl px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
              Комунальні послуги
            </p>
            <p className="mt-0.5 text-base font-bold tabular-nums">
              {totals.charged.toLocaleString("uk-UA")} ₴
            </p>
          </div>
        </div>

        {totals.paid > 0 &&
          (() => {
            const fullyPaid = totals.unpaid <= 0.5;
            const StatusIcon = fullyPaid ? CheckCircle2 : AlertCircle;
            const accentText = fullyPaid
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-amber-700 dark:text-amber-300";
            const amount = fullyPaid ? totals.paid : totals.unpaid;
            return (
              <div
                className={cn(
                  "mt-3 flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3",
                )}
                style={{
                  backgroundColor: fullyPaid
                    ? "rgba(111,148,98,0.22)"
                    : "rgba(217,152,69,0.22)",
                  borderColor: fullyPaid
                    ? "rgba(111,148,98,0.45)"
                    : "rgba(217,152,69,0.45)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <StatusIcon
                    className={cn("h-5 w-5 shrink-0", accentText)}
                    strokeWidth={2.4}
                  />
                  <span
                    className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      accentText,
                    )}
                  >
                    {fullyPaid ? "Сплачено" : "Залишилось доплатити"}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-lg font-extrabold tabular-nums",
                    accentText,
                  )}
                >
                  {amount.toLocaleString("uk-UA", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  ₴
                </span>
              </div>
            );
          })()}
      </div>

      {/* Metered readings — just numbers + photos, no cost calc */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <h3 className="mb-1 text-base font-semibold">Лічильники</h3>
        <p className="mb-3 text-xs text-foreground/55">
          Показники й фото для історії — без розрахунків.
        </p>
        <div className="space-y-3">
          {METERED_KINDS.map((kind) => {
            const r = readings.find((rr) => rr.kind === kind)!;
            const consumed = Math.max(0, r.current - r.previous);
            return (
              <ReadingRow
                key={kind}
                kind={kind}
                reading={r}
                consumed={consumed}
                onChange={(patch) => updateReading(kind, patch)}
                onPreviewPhoto={setPreviewSrc}
              />
            );
          })}
        </div>
      </div>

      {/* Bills */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <h3 className="mb-3 text-base font-semibold">Суми за місяць</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <FixedAmount
            kind="rent"
            label="Квартплата"
            value={rentAmount}
            onChange={setRentAmount}
            placeholder="11000"
          />
          <FixedAmount
            kind="rent"
            customIconKind="internet"
            label="Сума до сплати від ріелтора"
            value={charged}
            onChange={setCharged}
            placeholder="0"
          />
          <FixedAmount
            kind="rent"
            customIconKind="electricity"
            label="Сплачено"
            value={paid}
            onChange={setPaid}
            placeholder="0"
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Дата оплати
            </label>
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="input-glass flex w-full items-center gap-2 text-left"
            >
              <CalendarDays className="h-4 w-4 shrink-0 field-icon" />
              <span className="flex-1 text-sm">
                {paidAt ? (
                  format(parseISO(paidAt), "d MMMM yyyy", { locale: uk })
                ) : (
                  <span className="text-foreground/40">Не вказана</span>
                )}
              </span>
              {paidAt && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPaidAt("");
                  }}
                  className="text-xs text-foreground/45 underline-offset-2 hover:underline"
                >
                  очистити
                </span>
              )}
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
                  showDatePicker && "rotate-180",
                )}
              />
            </button>
          </div>
        </div>
        <div className="mt-3">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
            Фото квитанції від ріелтора
          </label>
          <PhotoUpload
            variant="tile"
            value={invoicePhoto}
            onChange={setInvoicePhoto}
            aspect={3 / 4}
            cropShape="rect"
            outputSize={1600}
            cropTitle="Обрізати квитанцію"
            label="Завантажити квитанцію"
            onPreview={setPreviewSrc}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
          Нотатки
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Будь-які примітки за цей місяць"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <DeleteIconButton
          variant="ghost"
          size="lg"
          onClick={() => setConfirmDelete(true)}
          className="rounded-2xl"
          label="Видалити місяць"
        />
        <Button onClick={onSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? "Збереження…" : "Зберегти зміни"}
        </Button>
      </div>

      <ImageViewerModal src={previewSrc} onClose={() => setPreviewSrc(null)} />

      <DatePickerModal
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        value={paidAt}
        onChange={setPaidAt}
        title="Дата оплати"
      />

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteMonth(month.id);
          onBack();
        }}
        title="Видалити запис місяця?"
        description={`«${monthLabel(month.month)}» буде видалено разом з показниками й фото.`}
      />
    </div>
  );
}

function ReadingRow({
  kind,
  reading,
  consumed,
  onChange,
  onPreviewPhoto,
}: {
  kind: UtilityKind;
  reading: RentReading;
  consumed: number;
  onChange: (patch: Partial<RentReading>) => void;
  onPreviewPhoto: (src: string) => void;
}) {
  const Icon = UTILITY_ICON[kind];
  const tint = UTILITY_TINT[kind];
  const hasConsumption = consumed > 0;
  return (
    <div className="glass-pill rounded-2xl p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: tint.bg, color: tint.fg }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <p className="truncate text-base font-bold">{UTILITY_LABELS[kind]}</p>
        </div>
        <div className="flex shrink-0 items-baseline gap-1.5">
          <span
            className="text-3xl font-black tabular-nums leading-none"
            style={{ color: hasConsumption ? tint.fg : "var(--foreground)" }}
          >
            {hasConsumption ? "+" : ""}
            {consumed.toLocaleString("uk-UA", { maximumFractionDigits: 1 })}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
            накрутило
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
            Попередній
          </label>
          <Input
            type="number"
            inputMode="decimal"
            value={reading.previous || ""}
            onChange={(e) =>
              onChange({ previous: parseFloat(e.target.value) || 0 })
            }
            className="text-base font-semibold tabular-nums"
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
            Поточний
          </label>
          <Input
            type="number"
            inputMode="decimal"
            value={reading.current || ""}
            onChange={(e) =>
              onChange({ current: parseFloat(e.target.value) || 0 })
            }
            className="text-base font-semibold tabular-nums"
            placeholder="0"
            style={{ color: hasConsumption ? tint.fg : undefined }}
          />
        </div>
      </div>

      <div className="mt-2">
        <PhotoUpload
          variant="thumbnail"
          value={reading.photo ?? ""}
          onChange={(p) => onChange({ photo: p })}
          aspect={3 / 4}
          cropShape="rect"
          outputSize={1280}
          cropTitle={`Фото лічильника · ${UTILITY_LABELS[kind]}`}
          label="Фото лічильника"
          onPreview={onPreviewPhoto}
        />
      </div>
    </div>
  );
}

function FixedAmount({
  kind,
  customIconKind,
  label,
  value,
  onChange,
  placeholder,
}: {
  kind: UtilityKind;
  customIconKind?: UtilityKind;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const iconKind = customIconKind ?? kind;
  const Icon = UTILITY_ICON[iconKind];
  const tint = UTILITY_TINT[iconKind];
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/55">
        <span
          className="flex h-5 w-5 items-center justify-center rounded-md"
          style={{ backgroundColor: tint.bg, color: tint.fg }}
        >
          <Icon className="h-3 w-3" />
        </span>
        {label}
      </label>
      <Input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
