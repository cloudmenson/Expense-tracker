"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Trash2,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { useRentalStore } from "@/lib/rental-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DatePickerModal } from "@/components/ui/date-picker-modal";
import { PhotoUpload } from "@/components/ui/photo-upload";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { TariffFormModal } from "@/components/rental/tariff-form-modal";
import { computeMonth, findTariff } from "@/lib/rental-calc";
import {
  METERED_KINDS,
  FIXED_KINDS,
  UTILITY_LABELS,
  type UtilityKind,
  type RentMonth,
  type RentReading,
} from "@/types/rental";
import { UTILITY_ICON, UTILITY_TINT } from "@/lib/utility-meta";

const monthLabel = (m: string) =>
  format(parseISO(`${m}-01`), "LLLL yyyy", { locale: uk });

const ALL_KINDS: UtilityKind[] = [...METERED_KINDS, ...FIXED_KINDS];

interface Props {
  month: RentMonth;
  onBack: () => void;
}

export function MonthDetail({ month, onBack }: Props) {
  const { tariffs, updateMonth, deleteMonth } = useRentalStore();

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
  const [editingTariffKind, setEditingTariffKind] = useState<UtilityKind | null>(
    null,
  );

  useEffect(() => {
    setReadings(initialReadings);
    setRentAmount(String(month.rentAmount || ""));
    setCharged(month.charged ? String(month.charged) : "");
    setPaid(month.paid ? String(month.paid) : "");
    setPaidAt(month.paidAt ?? "");
    setInvoicePhoto(month.invoicePhoto ?? "");
    setNotes(month.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month.id]);

  const updateReading = (kind: string, patch: Partial<RentReading>) =>
    setReadings((rs) =>
      rs.map((r) => (r.kind === kind ? { ...r, ...patch } : r)),
    );

  const draftMonth: RentMonth = {
    ...month,
    readings,
    rentAmount: parseFloat(rentAmount) || 0,
    charged: parseFloat(charged) || 0,
  };
  const comp = computeMonth(draftMonth, tariffs);
  const tone =
    comp.diff > 0.5 ? "danger" : comp.diff < -0.5 ? "success" : "neutral";

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
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Назад
        </Button>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-foreground/45 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
          aria-label="Видалити місяць"
        >
          <Trash2 className="h-4 w-4" />
        </button>
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
            {comp.expectedTotal.toLocaleString("uk-UA", {
              maximumFractionDigits: 0,
            })}{" "}
            ₴
          </p>
          <span className="text-xs text-foreground/45">за тарифами</span>
        </div>

        {comp.charged > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="glass-pill rounded-xl px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
                Виставив ріелтор
              </p>
              <p className="mt-0.5 text-base font-bold tabular-nums">
                {comp.charged.toLocaleString("uk-UA")} ₴
              </p>
            </div>
            <div
              className="rounded-xl px-3 py-2"
              style={{
                backgroundColor:
                  tone === "danger"
                    ? "rgba(199,90,74,0.14)"
                    : tone === "success"
                      ? "rgba(111,148,98,0.14)"
                      : "var(--brand-soft)",
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
                {tone === "danger"
                  ? "Накручено"
                  : tone === "success"
                    ? "Менше нарахували"
                    : "Збігається"}
              </p>
              <p
                className={`mt-0.5 inline-flex items-center gap-1 text-base font-bold tabular-nums ${
                  tone === "danger"
                    ? "text-rose-600 dark:text-rose-300"
                    : tone === "success"
                      ? "text-emerald-700 dark:text-emerald-300"
                      : ""
                }`}
              >
                {tone === "danger" ? (
                  <ArrowUp className="h-4 w-4" />
                ) : tone === "success" ? (
                  <ArrowDown className="h-4 w-4" />
                ) : null}
                {comp.diff > 0 ? "+" : ""}
                {comp.diff.toLocaleString("uk-UA", {
                  maximumFractionDigits: 0,
                })}{" "}
                ₴
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Metered readings */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <h3 className="mb-3 text-base font-semibold">Лічильники</h3>
        <div className="space-y-3">
          {METERED_KINDS.map((kind) => {
            const r = readings.find((rr) => rr.kind === kind)!;
            const tariff = findTariff(tariffs, kind, month.month);
            const consumed = Math.max(0, r.current - r.previous);
            const cost = tariff ? consumed * tariff.pricePerUnit : 0;
            return (
              <ReadingRow
                key={kind}
                kind={kind}
                reading={r}
                consumed={consumed}
                cost={cost}
                tariffLabel={
                  tariff
                    ? `${tariff.pricePerUnit.toLocaleString("uk-UA", { maximumFractionDigits: 4 })} ₴ / ${tariff.unitLabel}`
                    : "тариф не задано"
                }
                onChange={(patch) => updateReading(kind, patch)}
                onPreviewPhoto={setPreviewSrc}
                onEditTariff={() => setEditingTariffKind(kind)}
              />
            );
          })}
        </div>
      </div>

      {/* Fixed (rent + internet) */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <h3 className="mb-3 text-base font-semibold">Фіксовані</h3>
        <div className="space-y-3">
          <FixedRow
            kind="rent"
            label="Квартплата за цей місяць"
            value={rentAmount}
            onChange={setRentAmount}
            placeholder="11000"
          />
          {FIXED_KINDS.filter((k) => k !== "rent").map((kind) => {
            const r = readings.find((rr) => rr.kind === kind)!;
            const tariff = findTariff(tariffs, kind, month.month);
            const hint = tariff
              ? `тариф ${tariff.pricePerUnit.toLocaleString("uk-UA")} ₴/міс`
              : "";
            return (
              <FixedRow
                key={kind}
                kind={kind}
                label={UTILITY_LABELS[kind]}
                onEditTariff={() => setEditingTariffKind(kind)}
                value={r.current ? String(r.current) : ""}
                onChange={(v) =>
                  updateReading(kind, {
                    previous: 0,
                    current: parseFloat(v) || 0,
                  })
                }
                placeholder={tariff ? String(tariff.pricePerUnit) : "Сума"}
                hint={hint}
              />
            );
          })}
        </div>
      </div>

      {/* Invoice + payment */}
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <h3 className="mb-3 text-base font-semibold">Розрахунок ріелтора</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Сума, яку виставили
            </label>
            <Input
              type="number"
              inputMode="decimal"
              value={charged}
              onChange={(e) => setCharged(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
              Оплачено
            </label>
            <Input
              type="number"
              inputMode="decimal"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="sm:col-span-2">
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
                {paidAt
                  ? format(parseISO(paidAt), "d MMMM yyyy", { locale: uk })
                  : <span className="text-foreground/40">Не вказана</span>}
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
            </button>
          </div>
        </div>
        <div className="mt-3">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
            Фото квитанції
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

      <div className="sticky bottom-3 z-10 flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? "Збереження…" : "Зберегти зміни"}
        </Button>
      </div>

      <ImagePreviewModal src={previewSrc} onClose={() => setPreviewSrc(null)} />

      <DatePickerModal
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        value={paidAt}
        onChange={setPaidAt}
        title="Дата оплати"
      />

      {editingTariffKind && (
        <TariffFormModal
          open={true}
          onClose={() => setEditingTariffKind(null)}
          kind={editingTariffKind}
          tariff={findTariff(tariffs, editingTariffKind, month.month) ?? null}
          defaultEffectiveFrom={month.month}
        />
      )}

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
  cost,
  tariffLabel,
  onChange,
  onPreviewPhoto,
  onEditTariff,
}: {
  kind: UtilityKind;
  reading: RentReading;
  consumed: number;
  cost: number;
  tariffLabel: string;
  onChange: (patch: Partial<RentReading>) => void;
  onPreviewPhoto: (src: string) => void;
  onEditTariff: () => void;
}) {
  const Icon = UTILITY_ICON[kind];
  const tint = UTILITY_TINT[kind];
  return (
    <div className="glass-pill rounded-2xl p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: tint.bg, color: tint.fg }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">{UTILITY_LABELS[kind]}</p>
            <button
              type="button"
              onClick={onEditTariff}
              className="text-[10px] text-foreground/45 underline-offset-2 transition-colors hover:text-brand-deep hover:underline"
            >
              {tariffLabel}
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold tabular-nums">
            {consumed.toLocaleString("uk-UA", { maximumFractionDigits: 1 })}
          </p>
          <p className="text-[10px] text-foreground/45 tabular-nums">
            = {cost.toFixed(2)} ₴
          </p>
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
            className="text-sm"
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
            className="text-sm"
            placeholder="0"
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

function FixedRow({
  kind,
  label,
  value,
  onChange,
  placeholder,
  hint,
  onEditTariff,
}: {
  kind: UtilityKind;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  hint?: string;
  onEditTariff?: () => void;
}) {
  const Icon = UTILITY_ICON[kind];
  const tint = UTILITY_TINT[kind];
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
        {onEditTariff && (
          <button
            type="button"
            onClick={onEditTariff}
            className="text-foreground/40 normal-case tracking-normal underline-offset-2 transition-colors hover:text-brand-deep hover:underline"
          >
            ({hint || "тариф не задано"})
          </button>
        )}
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
