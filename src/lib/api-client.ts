import type {
  Expense,
  ExpenseDraft,
  Category,
  AppSettings,
  TrashItem,
} from "@/types/expense";
import type { Profile } from "@/types/profile";

const BASE = "/api";

export interface BootstrapPayload {
  expenses: Expense[];
  categories: Category[];
  settings: AppSettings;
}

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

/* ── Expenses ── */

export function fetchBootstrap(): Promise<BootstrapPayload> {
  return fetcher(`${BASE}/bootstrap`);
}

export function fetchExpenses(): Promise<Expense[]> {
  return fetcher(`${BASE}/expenses`);
}

export function createExpense(draft: ExpenseDraft): Promise<Expense> {
  return fetcher(`${BASE}/expenses`, {
    method: "POST",
    body: JSON.stringify(draft),
  });
}

export function updateExpense(
  id: string,
  data: Partial<ExpenseDraft>,
): Promise<Expense> {
  return fetcher(`${BASE}/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteExpense(id: string): Promise<{ ok: boolean }> {
  return fetcher(`${BASE}/expenses/${id}`, { method: "DELETE" });
}

/* ── Categories ── */

export function fetchCategories(): Promise<Category[]> {
  return fetcher(`${BASE}/categories`);
}

export function createCategory(
  cat: Omit<Category, "id" | "isCustom"> & { id?: string },
): Promise<Category> {
  return fetcher(`${BASE}/categories`, {
    method: "POST",
    body: JSON.stringify(cat),
  });
}

export function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id" | "isCustom">>,
): Promise<Category> {
  return fetcher(`${BASE}/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCategory(id: string): Promise<{ ok: boolean }> {
  return fetcher(`${BASE}/categories/${id}`, { method: "DELETE" });
}

/* ── Settings ── */

export function fetchSettings(): Promise<AppSettings | null> {
  return fetcher(`${BASE}/settings`);
}

export function updateSettings(
  data: Partial<AppSettings>,
): Promise<AppSettings> {
  return fetcher(`${BASE}/settings`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/* ── Data management ── */

export function exportAllData(): Promise<{
  expenses: Expense[];
  categories: Category[];
  settings: AppSettings;
  profiles?: Profile[];
  exportedAt: string;
}> {
  return fetcher(`${BASE}/data/export`);
}

export function importAllData(data: {
  expenses: Expense[];
  categories: Category[];
  settings: AppSettings;
  profiles?: Profile[];
}): Promise<{ ok: boolean }> {
  return fetcher(`${BASE}/data/import`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function clearAllData(): Promise<{ ok: boolean }> {
  return fetcher(`${BASE}/data/clear`, { method: "POST" });
}

/* ── Trash ── */

export function fetchTrash(): Promise<TrashItem[]> {
  return fetcher(`${BASE}/trash`);
}

export function restoreFromTrash(id: string): Promise<{ ok: boolean }> {
  return fetcher(`${BASE}/trash/${id}`, { method: "POST" });
}

export function deleteFromTrash(id: string): Promise<{ ok: boolean }> {
  return fetcher(`${BASE}/trash/${id}`, { method: "DELETE" });
}

export function clearTrash(): Promise<{ ok: boolean }> {
  return fetcher(`${BASE}/trash`, { method: "DELETE" });
}

/* ── Profiles ── */

export function fetchProfiles(): Promise<Profile[]> {
  return fetcher(`${BASE}/profiles`);
}

export function createProfile(
  data: Partial<
    Pick<
      Profile,
      | "name"
      | "color"
      | "monthlyIncome"
      | "inviteEmail"
      | "avatarEmoji"
      | "avatarImage"
      | "role"
      | "status"
    >
  >,
): Promise<Profile> {
  return fetcher(`${BASE}/profiles`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProfile(
  id: string,
  data: Partial<
    Pick<
      Profile,
      | "name"
      | "color"
      | "monthlyIncome"
      | "avatarEmoji"
      | "avatarImage"
      | "status"
      | "role"
    >
  >,
): Promise<Profile> {
  return fetcher(`${BASE}/profiles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProfile(id: string): Promise<{ ok: boolean }> {
  return fetcher(`${BASE}/profiles/${id}`, { method: "DELETE" });
}
