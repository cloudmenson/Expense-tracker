"use client";

import { create } from "zustand";

import type {
  Expense,
  ExpenseDraft,
  Category,
  AppSettings,
} from "@/types/expense";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import * as api from "@/lib/api-client";

/* ─── Default settings ─── */
const defaultSettings: AppSettings = {
  currency: "$",
  person1Name: "Партнёр 1",
  person2Name: "Партнёр 2",
  monthlyBudget: 5000,
  theme: "system",
  person1Color: "#22c55e",
  person2Color: "#3b82f6",
};

/* ─── Store shape ─── */
interface ExpenseStore {
  expenses: Expense[];
  categories: Category[];
  settings: AppSettings;

  /** Whether the store has been hydrated from MongoDB */
  _hydrated: boolean;
  /** Whether hydration is in progress */
  _loading: boolean;

  /** Load all data from MongoDB API */
  hydrate: () => Promise<void>;

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

  /** Re-set all local data (used after import/clear) */
  _setAll: (data: {
    expenses: Expense[];
    categories: Category[];
    settings: AppSettings;
  }) => void;
}

export const useExpenseStore = create<ExpenseStore>()((set, get) => ({
  expenses: [],
  categories: DEFAULT_CATEGORIES,
  settings: defaultSettings,
  _hydrated: false,
  _loading: false,

  /* ── Hydrate from MongoDB ── */
  hydrate: async () => {
    if (get()._hydrated || get()._loading) return;
    set({ _loading: true });

    try {
      const [expenses, categories, settings] = await Promise.all([
        api.fetchExpenses(),
        api.fetchCategories(),
        api.fetchSettings(),
      ]);

      set({
        expenses,
        categories: categories.length > 0 ? categories : DEFAULT_CATEGORIES,
        settings: { ...defaultSettings, ...(settings ?? {}) },
        _hydrated: true,
        _loading: false,
      });
    } catch (err) {
      console.error("Failed to hydrate store from MongoDB:", err);
      // Still mark as hydrated so app doesn't hang — will use defaults
      set({ _hydrated: true, _loading: false });
    }
  },

  /* ── Expenses (optimistic + API) ── */
  addExpense: (draft) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();
    const tempExpense: Expense = {
      id: tempId,
      ...draft,
      createdAt: now,
      updatedAt: now,
    };

    // Optimistic: add immediately
    set((s) => ({ expenses: [tempExpense, ...s.expenses] }));

    // Persist to MongoDB
    api
      .createExpense(draft)
      .then((saved) => {
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === tempId ? saved : e)),
        }));
      })
      .catch((err) => {
        console.error("Failed to save expense:", err);
        // Rollback
        set((s) => ({
          expenses: s.expenses.filter((e) => e.id !== tempId),
        }));
      });
  },

  updateExpense: (id, draft) => {
    // Optimistic update
    const prev = get().expenses.find((e) => e.id === id);
    set((s) => ({
      expenses: s.expenses.map((e) =>
        e.id === id
          ? { ...e, ...draft, updatedAt: new Date().toISOString() }
          : e,
      ),
    }));

    api.updateExpense(id, draft).catch((err) => {
      console.error("Failed to update expense:", err);
      // Rollback
      if (prev) {
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === id ? prev : e)),
        }));
      }
    });
  },

  deleteExpense: (id) => {
    const prev = get().expenses.find((e) => e.id === id);
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));

    api.deleteExpense(id).catch((err) => {
      console.error("Failed to delete expense:", err);
      if (prev) {
        set((s) => ({ expenses: [prev, ...s.expenses] }));
      }
    });
  },

  /* ── Categories (optimistic + API) ── */
  addCategory: (cat) => {
    const tempId = `custom-${Date.now()}`;
    const newCat: Category = { ...cat, id: tempId, isCustom: true };

    set((s) => ({ categories: [...s.categories, newCat] }));

    api
      .createCategory({ ...cat, id: tempId })
      .then((saved) => {
        set((s) => ({
          categories: s.categories.map((c) => (c.id === tempId ? saved : c)),
        }));
      })
      .catch((err) => {
        console.error("Failed to save category:", err);
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== tempId),
        }));
      });
  },

  updateCategory: (id, data) => {
    const prev = get().categories.find((c) => c.id === id);
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === id ? { ...c, ...data } : c,
      ),
    }));

    api.updateCategory(id, data).catch((err) => {
      console.error("Failed to update category:", err);
      if (prev) {
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? prev : c)),
        }));
      }
    });
  },

  deleteCategory: (id) => {
    const prev = get().categories.find((c) => c.id === id);
    set((s) => ({
      categories: s.categories.filter((c) => c.id !== id),
    }));

    api.deleteCategory(id).catch((err) => {
      console.error("Failed to delete category:", err);
      if (prev) {
        set((s) => ({ categories: [...s.categories, prev] }));
      }
    });
  },

  /* ── Settings (optimistic + API) ── */
  updateSettings: (patch) => {
    const prev = get().settings;
    set((s) => ({ settings: { ...s.settings, ...patch } }));

    api.updateSettings(patch).catch((err) => {
      console.error("Failed to update settings:", err);
      set({ settings: prev });
    });
  },

  /* ── Bulk set (for import/clear) ── */
  _setAll: (data) => {
    set({
      expenses: data.expenses,
      categories: data.categories,
      settings: data.settings,
    });
  },
}));
