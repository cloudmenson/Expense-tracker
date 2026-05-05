"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { CalendarDays, Trash2 } from "lucide-react";
import { useRentalStore } from "@/lib/rental-store";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { MonthPickerModal } from "@/components/ui/month-picker-modal";
import {
  UTILITY_LABELS,
  UTILITY_DEFAULT_UNIT,
  type UtilityKind,
  type Tariff,
} from "@/types/rental";
import { UTILITY_ICON, UTILITY_TINT } from "@/lib/utility-meta";

interface TariffFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Utility kind. Read-only — the form is opened from a specific reading row. */
  kind: UtilityKind;
  /** Existing tariff to edit, or null to create a new one. */
  tariff: Tariff | null;
  /** Default effectiveFrom (used when creating new). e.g. "2026-05". */
  defaultEffectiveFrom: string;
}

export function TariffFormModal({
  open,
  onClose,
  kind,
  tariff,
  defaultEffectiveFrom,
}: TariffFormModalProps) {
  const { createTariff, updateTariff, deleteTariff } = useRentalStore();
  const [price, setPrice] = useState(
    tariff ? String(tariff.pricePerUnit) : "",
  );
  const [unit, setUnit] = useState(tariff?.unitLabel ?? UTILITY_DEFAULT_UNIT[kind]);
  const [eff, setEff] = useState(tariff?.effectiveFrom ?? defaultEffectiveFrom);
  const [saving, setSaving] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const Icon = UTILITY_ICON[kind];
  const tint = UTILITY_TINT[kind];
  const canSave = !!price && !saving;

  const onSave = async () => {
    setSaving(true);
    try {
      if (tariff) {
        await updateTariff(tariff.id, {
          pricePerUnit: parseFloat(price) || 0,
          unitLabel: unit.trim() || UTILITY_DEFAULT_UNIT[kind],
          effectiveFrom: eff,
        });
      } else {
        await createTariff({
          kind,
          pricePerUnit: parseFloat(price) || 0,
          unitLabel: unit.trim() || UTILITY_DEFAULT_UNIT[kind],
          effectiveFrom: eff,
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tariff ? "Редагувати тариф" : "Новий тариф"}
      size="sm"
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl"
          style={{ backgroundColor: tint.bg, color: tint.fg }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold">{UTILITY_LABELS[kind]}</p>
          {tariff && (
            <p className="text-[11px] text-foreground/45">
              Останнє оновлення:{" "}
              {format(parseISO(tariff.updatedAt), "d MMM yyyy", { locale: uk })}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
            Ціна, ₴
          </label>
          <Input
            type="number"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
            Одиниця
          </label>
          <Input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="м³, кВт·год, грн/міс"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-foreground/50">
            Діє з
          </label>
          <button
            type="button"
            onClick={() => setShowMonthPicker(true)}
            className="input-glass flex w-full items-center gap-2 text-left"
          >
            <CalendarDays className="h-4 w-4 shrink-0 field-icon" />
            <span className="flex-1 text-sm">
              {format(parseISO(`${eff}-01`), "LLLL yyyy", { locale: uk })}
            </span>
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {tariff && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-foreground/45 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
            disabled={saving}
            aria-label="Видалити тариф"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onClose}
          disabled={saving}
        >
          Скасувати
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={!canSave}
          onClick={() => void onSave()}
        >
          {tariff ? "Зберегти" : "Додати"}
        </Button>
      </div>

      <MonthPickerModal
        open={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        value={eff}
        title="Тариф діє з"
        onConfirm={(m) => {
          setEff(m);
          setShowMonthPicker(false);
        }}
      />

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          if (!tariff) return;
          await deleteTariff(tariff.id);
          onClose();
        }}
        title="Видалити тариф?"
        description={
          tariff && (
            <>
              {UTILITY_LABELS[kind]} —{" "}
              <span className="font-semibold text-foreground">
                {tariff.pricePerUnit} ₴ / {tariff.unitLabel}
              </span>{" "}
              з {format(parseISO(`${tariff.effectiveFrom}-01`), "MM/yyyy")}
            </>
          )
        }
      />
    </Modal>
  );
}
