import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentlyViewedItem {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  price: number | null;
  special_price: number | null;
  discount_percentage: number;
  rating: string;
  review_count: number;
  viewedAt: number;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  addItem: (item: Omit<RecentlyViewedItem, "viewedAt">) => void;
  clearAll: () => void;
}

const MAX_ITEMS = 20;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          // Remove existing entry for same product
          const filtered = state.items.filter((i) => i.id !== item.id);
          // Add to front with timestamp
          const updated = [{ ...item, viewedAt: Date.now() }, ...filtered];
          // Keep only MAX_ITEMS
          return { items: updated.slice(0, MAX_ITEMS) };
        }),

      clearAll: () => set({ items: [] }),
    }),
    {
      name: "recently-viewed-storage",
    }
  )
);
