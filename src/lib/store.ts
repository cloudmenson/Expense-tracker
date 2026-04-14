"use client";

import { create } from "zustand";

import type {
  Expense,
  ExpenseDraft,
  Category,
  AppSettings,
  TrashItem,
} from "@/types/expense";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import * as api from "@/lib/api-client";

/* ─── Default settings ─── */
const defaultSettings: AppSettings = {
  currency: "$",
  person1Name: "Партнер 1",
  person2Name: "Партнер 2",
  person1Income: 2500,
  person2Income: 2500,
  theme: "system",
  person1Color: "#e11d48",
  person2Color: "#3b82f6",
  person1AvatarImage: undefined,
  person2AvatarImage: undefined,
};

/* ─── Store shape ─── */
interface ExpenseStore {
  expenses: Expense[];
  categories: Category[];
  settings: AppSettings;
  trashItems: TrashItem[];

  /** Whether the store has been hydrated from MongoDB */
  _hydrated: boolean;
  /** Whether hydration is in progress */
  _loading: boolean;

  /** Load all data from MongoDB API */
  hydrate: () => Promise<void>;

  // Expenses
  addExpense: (draft: ExpenseDraft) => Promise<{ ok: boolean; error?: string }>;
  updateExpense: (
    id: string,
    draft: Partial<ExpenseDraft>,
  ) => Promise<{ ok: boolean; error?: string }>;
  deleteExpense: (id: string) => Promise<{ ok: boolean; error?: string }>;

  // Categories
  addCategory: (
    cat: Omit<Category, "id" | "isCustom">,
  ) => Promise<{ ok: boolean; error?: string }>;
  updateCategory: (
    id: string,
    data: Partial<Omit<Category, "id" | "isCustom">>,
  ) => Promise<{ ok: boolean; error?: string }>;
  deleteCategory: (id: string) => Promise<{ ok: boolean; error?: string }>;

  // Settings
  updateSettings: (s: Partial<AppSettings>) => void;
  refreshSettings: () => Promise<void>;

  // Trash
  fetchTrash: () => Promise<void>;
  restoreFromTrash: (id: string) => Promise<{ ok: boolean; error?: string }>;
  deleteFromTrash: (id: string) => Promise<{ ok: boolean; error?: string }>;
  clearTrash: () => Promise<{ ok: boolean; error?: string }>;

  /** Directly patch settings state without an API call (used after profile save) */
  _patchSettings: (patch: Partial<AppSettings>) => void;

  /** Re-set all local data (used after import/clear) */
  _setAll: (data: {
    expenses: Expense[];
    categories: Category[];
    settings: AppSettings;
  }) => void;
}

type StrictPayer = "person1" | "person2";
type ExpenseDraftWithPayer = Omit<ExpenseDraft, "paidBy"> & {
  paidBy: StrictPayer;
};
type ExpenseDraftPatch = Partial<Omit<ExpenseDraft, "paidBy">> & {
  paidBy?: StrictPayer;
};

export const useExpenseStore = create<ExpenseStore>()((set, get) => ({
  expenses: [],
  categories: DEFAULT_CATEGORIES,
  settings: defaultSettings,
  trashItems: [],
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
  addExpense: async (draft) => {
    if (draft.paidBy !== "person1" && draft.paidBy !== "person2") {
      // Safety guard: UI should prevent this, but keep store type-safe.
      console.warn("Skipped expense creation: payer is not selected");
      return { ok: false, error: "Не вибрано, хто платив" };
    }

    const safeDraft: ExpenseDraftWithPayer = {
      ...draft,
      paidBy: draft.paidBy,
    };

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();
    const tempExpense: Expense = {
      id: tempId,
      ...safeDraft,
      createdAt: now,
      updatedAt: now,
    };

    // Optimistic: add immediately
    set((s) => ({ expenses: [tempExpense, ...s.expenses] }));

    // Persist to MongoDB
    try {
      const saved = await api.createExpense(safeDraft);
      set((s) => ({
        expenses: s.expenses.map((e) => (e.id === tempId ? saved : e)),
      }));
      return { ok: true };
    } catch (err) {
      console.error("Failed to save expense:", err);
      set((s) => ({
        expenses: s.expenses.filter((e) => e.id !== tempId),
      }));
      return { ok: false, error: "Не вдалося створити витрату" };
    }
  },

  updateExpense: async (id, draft) => {
    const { paidBy, ...rest } = draft;
    const safeDraft: ExpenseDraftPatch = {
      ...rest,
      ...(paidBy === "person1" || paidBy === "person2" ? { paidBy } : {}),
    };

    // Optimistic update
    const prev = get().expenses.find((e) => e.id === id);
    set((s) => ({
      expenses: s.expenses.map((e) =>
        e.id === id
          ? { ...e, ...safeDraft, updatedAt: new Date().toISOString() }
          : e,
      ),
    }));

    try {
      const saved = await api.updateExpense(id, safeDraft);
      set((s) => ({
        expenses: s.expenses.map((e) => (e.id === id ? saved : e)),
      }));
      return { ok: true };
    } catch (err) {
      console.error("Failed to update expense:", err);
      if (prev) {
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === id ? prev : e)),
        }));
      }
      return { ok: false, error: "Не вдалося оновити витрату" };
    }
  },

  deleteExpense: async (id) => {
    const prev = get().expenses.find((e) => e.id === id);
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));

    try {
      await api.deleteExpense(id);
      return { ok: true };
    } catch (err) {
      console.error("Failed to delete expense:", err);
      if (prev) {
        set((s) => ({ expenses: [prev, ...s.expenses] }));
      }
      return { ok: false, error: "Не вдалося видалити витрату" };
    }
  },

  /* ── Categories (optimistic + API) ── */
  addCategory: async (cat) => {
    const tempId = `custom-${Date.now()}`;
    const newCat: Category = { ...cat, id: tempId, isCustom: true };

    set((s) => ({ categories: [...s.categories, newCat] }));

    try {
      const saved = await api.createCategory({ ...cat, id: tempId });
      set((s) => ({
        categories: s.categories.map((c) => (c.id === tempId ? saved : c)),
      }));
      return { ok: true };
    } catch (err) {
      console.error("Failed to save category:", err);
      set((s) => ({
        categories: s.categories.filter((c) => c.id !== tempId),
      }));
      return { ok: false, error: "Не вдалося створити категорію" };
    }
  },

  updateCategory: async (id, data) => {
    const prev = get().categories.find((c) => c.id === id);
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === id ? { ...c, ...data } : c,
      ),
    }));

    try {
      const saved = await api.updateCategory(id, data);
      set((s) => ({
        categories: s.categories.map((c) => (c.id === id ? saved : c)),
      }));
      return { ok: true };
    } catch (err) {
      console.error("Failed to update category:", err);
      if (prev) {
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? prev : c)),
        }));
      }
      return { ok: false, error: "Не вдалося оновити категорію" };
    }
  },

  deleteCategory: async (id) => {
    const prev = get().categories.find((c) => c.id === id);
    set((s) => ({
      categories: s.categories.filter((c) => c.id !== id),
    }));

    try {
      await api.deleteCategory(id);
      return { ok: true };
    } catch (err) {
      console.error("Failed to delete category:", err);
      if (prev) {
        set((s) => ({ categories: [...s.categories, prev] }));
      }
      return { ok: false, error: "Не вдалося видалити категорію" };
    }
  },

  /* ── Settings (optimistic + API) ── */
  updateSettings: (patch) => {
    const prev = get().settings;
    set((s) => ({ settings: { ...s.settings, ...patch } }));

    api
      .updateSettings(patch)
      .then((serverSettings) => {
        set({ settings: { ...defaultSettings, ...serverSettings } });
      })
      .catch((err) => {
        console.error("Failed to update settings:", err);
        set({ settings: prev });
      });
  },

  refreshSettings: async () => {
    try {
      const settings = await api.fetchSettings();
      set({ settings: { ...defaultSettings, ...(settings ?? {}) } });
    } catch (err) {
      console.error("Failed to refresh settings:", err);
    }
  },

  /* ── Direct settings patch (no API call) ── */
  _patchSettings: (patch) => {
    set((s) => ({ settings: { ...s.settings, ...patch } }));
  },

  /* ── Bulk set (for import/clear) ── */
  _setAll: (data) => {
    set({
      expenses: data.expenses,
      categories: data.categories,
      settings: data.settings,
    });
  },

  /* ── Trash ── */
  fetchTrash: async () => {
    try {
      const items = await api.fetchTrash();
      set({ trashItems: items });
    } catch (err) {
      console.error("Failed to fetch trash:", err);
    }
  },

  restoreFromTrash: async (id) => {
    const item = get().trashItems.find((t) => t.id === id);
    if (!item) return { ok: false, error: "Елемент не знайдено" };

    // Optimistic: remove from trash
    set((s) => ({ trashItems: s.trashItems.filter((t) => t.id !== id) }));

    try {
      await api.restoreFromTrash(id);
      // Re-fetch so restored item appears in expenses/categories
      const [expenses, categories] = await Promise.all([
        api.fetchExpenses(),
        api.fetchCategories(),
      ]);
      set({ expenses, categories });
      return { ok: true };
    } catch (err) {
      console.error("Failed to restore from trash:", err);
      set((s) => ({ trashItems: [...s.trashItems, item] }));
      return { ok: false, error: "Не вдалося відновити елемент" };
    }
  },

  deleteFromTrash: async (id) => {
    const item = get().trashItems.find((t) => t.id === id);
    set((s) => ({ trashItems: s.trashItems.filter((t) => t.id !== id) }));

    try {
      await api.deleteFromTrash(id);
      return { ok: true };
    } catch (err) {
      console.error("Failed to permanently delete from trash:", err);
      if (item) {
        set((s) => ({ trashItems: [...s.trashItems, item] }));
      }
      return { ok: false, error: "Не вдалося видалити елемент назавжди" };
    }
  },

  clearTrash: async () => {
    const prev = get().trashItems;
    set({ trashItems: [] });

    try {
      await api.clearTrash();
      return { ok: true };
    } catch (err) {
      console.error("Failed to clear trash:", err);
      set({ trashItems: prev });
      return { ok: false, error: "Не вдалося очистити кошик" };
    }
  },
}));
