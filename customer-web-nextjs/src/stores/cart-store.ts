import { create } from "zustand";
import { persist } from "zustand/middleware";
import { trackFunnelEvent } from "@/lib/funnel-tracker";

export interface CartItem {
  id: number;
  product_id: number;
  variant_id?: number;
  store_id?: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  original_price?: number;
  quantity: number;
  max_cart_qty: number;
  stock_is_exact?: boolean;
  stock_quantity?: number;
  variant_label?: string;
  /** When set, this item was added as part of a bundle. The bundle-aware
   *  subtotal calculation in cart-subtotal.ts groups by this ID and applies
   *  the bundle_price instead of the sum of item prices. */
  bundle_id?: number;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  getItemQuantity: (productId: number, variantId?: number) => number;
  openDrawer: () => void;
  closeDrawer: () => void;
}

function getCartKey(item: { product_id: number; variant_id?: number }) {
  return item.variant_id
    ? `${item.product_id}-${item.variant_id}`
    : `${item.product_id}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      addItem: (item) =>
        set((state) => {
          if (!Number.isFinite(item.price) || item.price <= 0) {
            return state;
          }
          const key = getCartKey(item);
          const existing = state.items.find(
            (i) => getCartKey(i) === key
          );
          if (existing) {
            const maxQuantity = Math.min(
              existing.max_cart_qty || 99,
              item.max_cart_qty || 99
            );
            const newQty = Math.min(
              existing.quantity + item.quantity,
              maxQuantity
            );
            return {
              items: state.items.map((i) =>
                getCartKey(i) === key
                  ? {
                      ...i,
                      quantity: newQty,
                      max_cart_qty: maxQuantity,
                      stock_is_exact: item.stock_is_exact ?? i.stock_is_exact,
                      stock_quantity: item.stock_quantity ?? i.stock_quantity,
                    }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (id) =>
        set((state) => {
          const removed = state.items.find((i) => i.id === id);
          if (removed) {
            trackFunnelEvent({
              event: "remove_from_cart",
              product_id: removed.product_id,
              amount: removed.price * removed.quantity,
              meta: {
                slug: removed.slug,
                quantity: removed.quantity,
                variant_id: removed.variant_id,
              },
            });
          }

          return {
            items: state.items.filter((i) => i.id !== id),
          };
        }),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i;
            const clampedQty = Math.max(1, Math.min(quantity, i.max_cart_qty || 99));
            return { ...i, quantity: clampedQty };
          }),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemQuantity: (productId, variantId) => {
        const key = variantId ? `${productId}-${variantId}` : `${productId}`;
        const item = get().items.find((i) => getCartKey(i) === key);
        return item?.quantity ?? 0;
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
