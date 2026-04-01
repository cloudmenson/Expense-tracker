/* ─── Category ─── */
export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isCustom: boolean;
}

/* ─── Expense ─── */
export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  paidBy: "person1" | "person2";
  date: string;
  note?: string;
  emoji?: string;
  createdAt: string;
  updatedAt: string;
}

/* ─── Draft (form) ─── */
export interface ExpenseDraft {
  title: string;
  amount: number;
  categoryId: string;
  paidBy: "person1" | "person2";
  date: string;
  note?: string;
  emoji?: string;
}

/* ─── Summary helpers ─── */
export interface MonthSummary {
  month: string;
  label: string;
  total: number;
  person1Total: number;
  person2Total: number;
  byCategory: Record<string, number>;
}

export interface CategorySummary {
  categoryId: string;
  total: number;
  count: number;
  percentage: number;
}

/* ─── Settings ─── */
export interface AppSettings {
  currency: string;
  person1Name: string;
  person2Name: string;
  monthlyBudget: number;
  theme: "light" | "dark" | "system";
}
