"use client";

import { useMemo, useState } from "react";
import { Plus, Calendar, Receipt } from "lucide-react";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { useRentalStore } from "@/lib/rental-store";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MonthPickerModal } from "@/components/ui/month-picker-modal";
import { computeMonth } from "@/lib/rental-calc";
import {
  METERED_KINDS,
  FIXED_KINDS,
  type UtilityKind,
} from "@/types/rental";
import { UTILITY_ICON, UTILITY_TINT } from "@/lib/utility-meta";
import { MonthDetail } from "./month-detail";

const monthLabel = (m: string) =>
  format(parseISO(`${m}-01`), "LLLL yyyy", { locale: uk });

export function MonthsSection() {
  const { months, createMonth, updateMonthReadings } = useRentalStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const sorted = useMemo(
    () => [...months].sort((a, b) => b.month.localeCompare(a.month)),
    [months],
  );

  const opened = openId ? sorted.find((m) => m.id === openId) : null;
  const existingMonths = useMemo(() => months.map((m) => m.month), [months]);

  const onCreateMonth = async (monthKey: string) => {
    const prevMonth =
      [...months]
        .filter((m) => m.month < monthKey)
        .sort((a, b) => b.month.localeCompare(a.month))[0] ?? null;

    const created = await createMonth(monthKey);
    if (!created) return;

    const defaultKinds: UtilityKind[] = [...METERED_KINDS, ...FIXED_KINDS];
    const seedReadings = defaultKinds.map((kind) => {
      const prev = prevMonth?.readings.find((r) => r.kind === kind);
      return {
        kind,
        previous: prev?.current ?? 0,
        current: prev?.current ?? 0,
        photo: "",
      };
    });

    await updateMonthReadings(created.id, seedReadings);
    setPickerOpen(false);
    setOpenId(created.id);
  };

  if (opened) {
    return <MonthDetail month={opened} onBack={() => setOpenId(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex-1 text-sm text-foreground/55">
          Кожен місяць — окремий запис із показниками лічильників, фото квитанції
          та сумами оплат.
        </p>
        <Button variant="primary" onClick={() => setPickerOpen(true)}>
          <Plus className="h-4 w-4" /> Місяць
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Поки жодного місяця"
          description="Створи перший місяць — підставимо показники з нуля, далі автоматично братимемо з попереднього."
          action={{
            label: "Додати місяць",
            onClick: () => setPickerOpen(true),
          }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((m) => {
            const totals = computeMonth(m);
            return (
              <button
                key={m.id}
                onClick={() => setOpenId(m.id)}
                className="glass-card rounded-2xl p-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                      {monthLabel(m.month)}
                    </p>
                    <p
                      className="mt-1 text-2xl font-black tabular-nums"
                      style={{ color: "var(--brand-deep)" }}
                    >
                      {totals.total.toLocaleString("uk-UA", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      ₴
                    </p>
                    <p className="text-[11px] text-foreground/45">
                      {totals.rentAmount.toLocaleString("uk-UA")} +{" "}
                      {totals.charged.toLocaleString("uk-UA")} ₴
                    </p>
                  </div>
                  {m.invoicePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.invoicePhoto}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-foreground/10"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-foreground/5 text-foreground/45">
                      <Receipt className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {totals.paid > 0 && (
                  <div
                    className="mt-3 flex items-center justify-between rounded-xl px-3 py-2 text-xs"
                    style={{
                      backgroundColor:
                        totals.unpaid > 0.5
                          ? "rgba(217,152,69,0.14)"
                          : "rgba(111,148,98,0.14)",
                    }}
                  >
                    <span className="text-foreground/55">
                      {totals.unpaid > 0.5 ? "Залишилось" : "Оплачено"}
                    </span>
                    <span
                      className={`font-bold tabular-nums ${
                        totals.unpaid > 0.5
                          ? "text-amber-700 dark:text-amber-300"
                          : "text-emerald-700 dark:text-emerald-300"
                      }`}
                    >
                      {totals.unpaid > 0.5
                        ? `${totals.unpaid.toLocaleString("uk-UA", { maximumFractionDigits: 0 })} ₴`
                        : `${totals.paid.toLocaleString("uk-UA", { maximumFractionDigits: 0 })} ₴`}
                    </span>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                  {m.readings
                    .filter((r) => METERED_KINDS.includes(r.kind as UtilityKind))
                    .map((r) => {
                      const Icon = UTILITY_ICON[r.kind as UtilityKind];
                      const tint = UTILITY_TINT[r.kind as UtilityKind];
                      const consumed = Math.max(0, r.current - r.previous);
                      return (
                        <span
                          key={r.kind}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 tabular-nums"
                          style={{ backgroundColor: tint.bg, color: tint.fg }}
                        >
                          <Icon className="h-3 w-3" />
                          {consumed.toLocaleString("uk-UA", {
                            maximumFractionDigits: 1,
                          })}
                        </span>
                      );
                    })}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <MonthPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={onCreateMonth}
        title="Новий місяць"
        disabledMonths={existingMonths}
      />
    </div>
  );
}
