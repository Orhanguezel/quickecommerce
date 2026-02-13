import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  variant_label?: string;
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
          const key = getCartKey(item);
          const existing = state.items.find(
            (i) => getCartKey(i) === key
          );
          if (existing) {
            const newQty = Math.min(
              existing.quantity + item.quantity,
              item.max_cart_qty || 99
            );
            return {
              items: state.items.map((i) =>
                getCartKey(i) === key ? { ...i, quantity: newQty } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

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
