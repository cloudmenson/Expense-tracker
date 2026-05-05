import type { RentMonth } from "@/types/rental";

export interface MonthTotals {
  rentAmount: number;
  charged: number;
  total: number;
  paid: number;
  unpaid: number;
}

export function computeMonth(month: RentMonth): MonthTotals {
  const rentAmount = month.rentAmount ?? 0;
  const charged = month.charged ?? 0;
  const paid = month.paid ?? 0;
  const total = rentAmount + charged;
  return {
    rentAmount,
    charged,
    total,
    paid,
    unpaid: Math.max(0, total - paid),
  };
}
