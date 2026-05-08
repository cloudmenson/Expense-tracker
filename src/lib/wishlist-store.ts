"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { WishItem, WishItemDraft } from "@/types/wishlist";

const BASE = "/api/wishlist";

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

interface WishlistStore {
  items: WishItem[];
  hydrated: boolean;
  loading: boolean;

  hydrate: () => Promise<void>;

  createItem: (draft: WishItemDraft) => Promise<WishItem>;
  updateItem: (id: string, patch: Partial<WishItemDraft>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      loading: false,

      hydrate: async () => {
        if (get().loading) return;
        set({ loading: true });
        try {
          const items = await fetcher<WishItem[]>(BASE);
          set({ items, hydrated: true });
        } finally {
          set({ loading: false });
        }
      },

      createItem: async (draft) => {
        const created = await fetcher<WishItem>(BASE, {
          method: "POST",
          body: JSON.stringify(draft),
        });
        set({ items: [created, ...get().items] });
        return created;
      },

      updateItem: async (id, patch) => {
        const updated = await fetcher<WishItem>(`${BASE}/${id}`, {
          method: "PUT",
          body: JSON.stringify(patch),
        });
        set({
          items: get().items.map((i) => (i.id === id ? updated : i)),
        });
      },

      deleteItem: async (id) => {
        await fetcher(`${BASE}/${id}`, { method: "DELETE" });
        set({ items: get().items.filter((i) => i.id !== id) });
      },
    }),
    {
      name: "wishlist-store",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
