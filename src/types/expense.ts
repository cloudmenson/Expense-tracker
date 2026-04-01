/* ─── Category ─── */
export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isCustom: boolean;
}

/* ─── Shopping list item ─── */
export interface ExpenseItem {
  name: string;
  price: number;
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
  items?: ExpenseItem[];
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
  items?: ExpenseItem[];
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
  person1Color?: string;
  person2Color?: string;
}
