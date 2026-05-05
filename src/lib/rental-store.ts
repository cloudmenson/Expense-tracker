"use client";

import { create } from "zustand";
import type {
  Contact,
  ContactDraft,
  Tariff,
  RentMonth,
  RentReading,
  UtilityKind,
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
  tariffs: Tariff[];
  months: RentMonth[];
  hydrated: boolean;
  loading: boolean;

  hydrate: () => Promise<void>;

  createContact: (draft: ContactDraft) => Promise<Contact>;
  updateContact: (id: string, patch: Partial<ContactDraft>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  createTariff: (input: {
    kind: UtilityKind;
    pricePerUnit: number;
    unitLabel: string;
    effectiveFrom: string;
  }) => Promise<void>;
  updateTariff: (id: string, patch: Partial<Tariff>) => Promise<void>;
  deleteTariff: (id: string) => Promise<void>;

  createMonth: (month: string) => Promise<RentMonth | null>;
  updateMonth: (id: string, patch: Partial<RentMonth>) => Promise<void>;
  updateMonthReadings: (id: string, readings: RentReading[]) => Promise<void>;
  deleteMonth: (id: string) => Promise<void>;
}

export const useRentalStore = create<RentalStore>()((set, get) => ({
  contacts: [],
  tariffs: [],
  months: [],
  hydrated: false,
  loading: false,

  hydrate: async () => {
    if (get().hydrated || get().loading) return;
    set({ loading: true });
    try {
      const data = await fetcher<{
        contacts: Contact[];
        tariffs: Tariff[];
        months: RentMonth[];
      }>(`${BASE}/bootstrap`);
      set({
        contacts: data.contacts,
        tariffs: data.tariffs,
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

  createTariff: async (input) => {
    const created = await fetcher<Tariff>(`${BASE}/tariffs`, {
      method: "POST",
      body: JSON.stringify(input),
    });
    set({ tariffs: [created, ...get().tariffs] });
  },

  updateTariff: async (id, patch) => {
    const updated = await fetcher<Tariff>(`${BASE}/tariffs/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
    set({
      tariffs: get().tariffs.map((t) => (t.id === id ? updated : t)),
    });
  },

  deleteTariff: async (id) => {
    await fetcher(`${BASE}/tariffs/${id}`, { method: "DELETE" });
    set({ tariffs: get().tariffs.filter((t) => t.id !== id) });
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
}));
