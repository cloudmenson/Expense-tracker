"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";

import type {
  Expense,
  ExpenseDraft,
  Category,
  AppSettings,
} from "@/types/expense";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

/* ─── Default settings ─── */
const defaultSettings: AppSettings = {
  currency: "$",
  person1Name: "Партнёр 1",
  person2Name: "Партнёр 2",
  monthlyBudget: 5000,
  theme: "system",
};

/* ─── Store shape ─── */
interface ExpenseStore {
  expenses: Expense[];
  categories: Category[];
  settings: AppSettings;

  // Expenses
  addExpense: (draft: ExpenseDraft) => void;
  updateExpense: (id: string, draft: Partial<ExpenseDraft>) => void;
  deleteExpense: (id: string) => void;

  // Categories
  addCategory: (cat: Omit<Category, "id" | "isCustom">) => void;
  updateCategory: (
    id: string,
    data: Partial<Omit<Category, "id" | "isCustom">>,
  ) => void;
  deleteCategory: (id: string) => void;

  // Settings
  updateSettings: (s: Partial<AppSettings>) => void;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: [],
      categories: DEFAULT_CATEGORIES,
      settings: defaultSettings,

      /* ── Expenses ── */
      addExpense: (draft) => {
        const now = new Date().toISOString();
        const expense: Expense = {
          id: uuid(),
          ...draft,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ expenses: [expense, ...s.expenses] }));
      },

      updateExpense: (id, draft) =>
        set((s) => ({
          expenses: s.expenses.map((e) =>
            e.id === id
              ? { ...e, ...draft, updatedAt: new Date().toISOString() }
              : e,
          ),
        })),

      deleteExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      /* ── Categories ── */
      addCategory: (cat) =>
        set((s) => ({
          categories: [...s.categories, { ...cat, id: uuid(), isCustom: true }],
        })),

      updateCategory: (id, data) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...data } : c,
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),

      /* ── Settings ── */
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
    }),
    {
      name: "couple-expense-tracker",
    },
  ),
);
