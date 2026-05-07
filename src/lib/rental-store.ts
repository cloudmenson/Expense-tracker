"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Contact,
  ContactDraft,
  RentMonth,
  RentReading,
} from "@/types/rental";

const BASE = "/api/rental";

async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown");
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

interface RentalStore {
  contacts: Contact[];
  months: RentMonth[];
  hydrated: boolean;
  loading: boolean;

  hydrate: () => Promise<void>;

  createContact: (draft: ContactDraft) => Promise<Contact>;
  updateContact: (id: string, patch: Partial<ContactDraft>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  createMonth: (month: string) => Promise<RentMonth | null>;
  updateMonth: (id: string, patch: Partial<RentMonth>) => Promise<void>;
  updateMonthReadings: (id: string, readings: RentReading[]) => Promise<void>;
  deleteMonth: (id: string) => Promise<void>;
}

export const useRentalStore = create<RentalStore>()(
  persist(
    (set, get) => ({
  contacts: [],
  months: [],
  hydrated: false,
  loading: false,

  hydrate: async () => {
    // Same rationale as the expense store: refetch once per session, but
    // `hydrated` is set to true by `onRehydrateStorage` so the UI doesn't
    // skeleton-flash when we already have cached data in localStorage.
    if (get().loading) return;
    set({ loading: true });
    try {
      const data = await fetcher<{
        contacts: Contact[];
        months: RentMonth[];
      }>(`${BASE}/bootstrap`);
      set({
        contacts: data.contacts,
        months: data.months,
        hydrated: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  createContact: async (draft) => {
    const created = await fetcher<Contact>(`${BASE}/contacts`, {
      method: "POST",
      body: JSON.stringify(draft),
    });
    set({ contacts: [...get().contacts, created] });
    return created;
  },

  updateContact: async (id, patch) => {
    const updated = await fetcher<Contact>(`${BASE}/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
    set({
      contacts: get().contacts.map((c) => (c.id === id ? updated : c)),
    });
  },

  deleteContact: async (id) => {
    await fetcher(`${BASE}/contacts/${id}`, { method: "DELETE" });
    set({ contacts: get().contacts.filter((c) => c.id !== id) });
  },

  createMonth: async (month) => {
    try {
      const created = await fetcher<RentMonth>(`${BASE}/months`, {
        method: "POST",
        body: JSON.stringify({ month }),
      });
      set({ months: [created, ...get().months] });
      return created;
    } catch {
      return null;
    }
  },

  updateMonth: async (id, patch) => {
    const updated = await fetcher<RentMonth>(`${BASE}/months/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
    set({
      months: get().months.map((m) => (m.id === id ? updated : m)),
    });
  },

  updateMonthReadings: async (id, readings) => {
    const updated = await fetcher<RentMonth>(`${BASE}/months/${id}`, {
      method: "PUT",
      body: JSON.stringify({ readings }),
    });
    set({
      months: get().months.map((m) => (m.id === id ? updated : m)),
    });
  },

  deleteMonth: async (id) => {
    await fetcher(`${BASE}/months/${id}`, { method: "DELETE" });
    set({ months: get().months.filter((m) => m.id !== id) });
  },
    }),
    {
      name: "rental-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Persist only the data; `hydrated` / `loading` reset on each load so
      // the next session always re-syncs with MongoDB.
      partialize: (state) => ({
        contacts: state.contacts,
        months: state.months,
      }),
      // Mark `hydrated` true once the localStorage snapshot is restored so
      // /rental can render its cached state immediately while we re-fetch.
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
