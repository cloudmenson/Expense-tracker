import type {
  RentMonth,
  Tariff,
  MonthComputation,
  ReadingComputation,
  UtilityKind,
} from "@/types/rental";
import { FIXED_KINDS } from "@/types/rental";

/**
 * Pick the tariff for a given kind that applies to a month.
 * The "applicable" tariff is the most recent one with effectiveFrom <= month.
 */
export function findTariff(
  tariffs: Tariff[],
  kind: string,
  month: string,
): Tariff | undefined {
  return tariffs
    .filter((t) => t.kind === kind && t.effectiveFrom <= month)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
}

export function computeMonth(
  month: RentMonth,
  tariffs: Tariff[],
): MonthComputation {
  const readingsComp: ReadingComputation[] = month.readings.map((r) => {
    const tariff = findTariff(tariffs, r.kind, month.month);
    const consumed = Math.max(0, r.current - r.previous);
    const pricePerUnit = tariff?.pricePerUnit ?? 0;
    const unitLabel = tariff?.unitLabel ?? "";
    const isFixed = FIXED_KINDS.includes(r.kind as UtilityKind);
    const expectedCost = isFixed ? pricePerUnit : consumed * pricePerUnit;
    return {
      kind: r.kind,
      consumed,
      pricePerUnit,
      unitLabel,
      expectedCost,
    };
  });

  const meteredCosts = readingsComp
    .filter((r) => !FIXED_KINDS.includes(r.kind as UtilityKind))
    .reduce((s, r) => s + r.expectedCost, 0);

  const fixedCosts = readingsComp
    .filter((r) => FIXED_KINDS.includes(r.kind as UtilityKind))
    .reduce((s, r) => s + r.expectedCost, 0);

  const expectedTotal = fixedCosts + meteredCosts + (month.rentAmount ?? 0);
  const charged = month.charged ?? 0;
  const diff = charged - expectedTotal;

  return {
    month: month.month,
    rentAmount: month.rentAmount ?? 0,
    fixedCosts,
    meteredCosts,
    expectedTotal,
    charged,
    diff,
    readings: readingsComp,
  };
}
