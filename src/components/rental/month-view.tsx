"use client";

import { useState } from "react";
import { Pencil, CalendarDays } from "lucide-react";
import { DeleteIconButton } from "@/components/ui/delete-icon-button";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { computeMonth } from "@/lib/rental-calc";
import {
  METERED_KINDS,
  FIXED_KINDS,
  UTILITY_LABELS,
  type UtilityKind,
  type RentMonth,
} from "@/types/rental";
import { UTILITY_ICON, UTILITY_TINT } from "@/lib/utility-meta";
import { ImageViewerModal } from "@/components/ui/image-viewer-modal";

const monthLabel = (m: string) =>
  format(parseISO(`${m}-01`), "LLLL yyyy", { locale: uk });

const ALL_KINDS: UtilityKind[] = [...METERED_KINDS, ...FIXED_KINDS];

interface MonthViewProps {
  month: RentMonth;
  onEdit: () => void;
  onDelete: () => void;
}

export function MonthView({ month, onEdit, onDelete }: MonthViewProps) {
  const totals = computeMonth(month);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {/* Header — icon + title + amount */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-2xl">
          <CalendarDays className="h-6 w-6 text-brand" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold">{monthLabel(month.month)}</h3>
          <p
            className="mt-0.5 text-2xl font-extrabold"
            style={{ color: "var(--brand-deep)" }}
          >
            {totals.total.toLocaleString("uk-UA", {
              maximumFractionDigits: 0,
            })}{" "}
            ₴
          </p>
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-3">
        {/* Rent */}
        <div className="glass-pill flex items-center justify-between rounded-xl px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-foreground/40">
            Оренда квартири
          </span>
          <span className="text-sm font-semibold">
            {month.rentAmount?.toLocaleString("uk-UA")} ₴
          </span>
        </div>

        {/* Charged */}
        <div className="glass-pill flex items-center justify-between rounded-xl px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-foreground/40">
            Комунальні послуги
          </span>
          <span className="text-sm font-semibold">
            {month.charged?.toLocaleString("uk-UA")} ₴
          </span>
        </div>

        {/* Paid */}
        <div className="glass-pill flex items-center justify-between rounded-xl px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wider text-foreground/40">
            Сплачено
          </span>
          <span className="text-sm font-semibold">
            {month.paid?.toLocaleString("uk-UA")} ₴
          </span>
        </div>

        {/* Paid At */}
        {month.paidAt && (
          <div className="glass-pill flex items-center justify-between rounded-xl px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wider text-foreground/40">
              Дата оплати
            </span>
            <span className="text-sm font-semibold">
              {format(parseISO(month.paidAt), "dd.MM.yyyy", { locale: uk })}
            </span>
          </div>
        )}

        {/* Readings */}
        <div className="glass-pill rounded-xl px-4 py-3">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-foreground/40">
            Показники лічильників та інша інформація
          </span>
          <div className="space-y-2">
            {ALL_KINDS.map((kind) => {
              const reading = month.readings.find((r) => r.kind === kind);
              const Icon = UTILITY_ICON[kind];
              const tint = UTILITY_TINT[kind];
              const prev = reading?.previous ?? 0;
              const curr = reading?.current ?? 0;
              const isMetered = METERED_KINDS.includes(kind);
              const diff = curr - prev;
              const diffLabel =
                diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "0";
              return (
                <div
                  key={kind}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-foreground/70">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-lg"
                      style={{ backgroundColor: tint.bg, color: tint.fg }}
                    >
                      <Icon className="h-3 w-3" />
                    </div>
                    {UTILITY_LABELS[kind]}
                  </span>
                  <span className="font-bold tabular-nums">
                    {isMetered ? (
                      <>
                        <span className="text-foreground/45">{prev}</span>
                        <span className="mx-1.5 text-foreground/30">→</span>
                        <span style={{ color: "var(--brand-deep)" }}>
                          {curr}
                        </span>
                        <span className="ml-1.5 text-foreground/45">
                          ({diffLabel})
                        </span>
                      </>
                    ) : (
                      <span style={{ color: "var(--brand-deep)" }}>{curr}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Invoice Photo */}
        {month.invoicePhoto && (
          <div className="glass-pill rounded-xl px-4 py-3">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-foreground/40">
              Фото квитанції від ріелтора
            </span>
            <div className="flex h-32 w-full items-center justify-center rounded-lg border bg-foreground/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={month.invoicePhoto}
                alt="Квитанція"
                className="h-full w-full rounded-lg object-cover cursor-zoom-in"
                onClick={() => setPreviewSrc(month.invoicePhoto!)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setPreviewSrc(month.invoicePhoto!);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Notes */}
        {month.notes && (
          <div className="glass-pill rounded-xl px-4 py-3">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-foreground/40">
              Нотатки
            </span>
            <p className="text-sm text-foreground/70">{month.notes}</p>
          </div>
        )}
      </div>

      {/* Edit & Delete buttons */}
      <div className="flex gap-3">
        <button onClick={onEdit} className="btn-primary flex-1">
          <Pencil className="h-4 w-4" />
          Редагувати
        </button>

        <DeleteIconButton onClick={onDelete} label="Видалити місяць" />
      </div>

      <ImageViewerModal src={previewSrc} onClose={() => setPreviewSrc(null)} />
    </div>
  );
}
