"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

// 🔹 Variant details for a product
interface VariantDetails {
  id: number;
  variant_slug: string;
  sku: string;
  attributes: Record<string, string>;
}

// 🔹 Structure of a cart item
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  specialPrice?: number;
  variantDetails?: VariantDetails;
  store_id?: number;
  store?: string;
  store_tax?: string;
  store_delivery_time?: string;
  stock?: number;
  max_cart_qty?: number;
  additional_charge_name?: string;
  additional_charge_amount?: string;
  additional_charge_type?: string;
}

// 🔹 Cart state
interface CartState {
  cart: CartItem[];
  totalPrice: number;
}

// ---------------- Utility Functions ---------------- //

// Save cart to localStorage
const saveToLocalStorage = (cart: CartItem[]) => {
  if (typeof window !== "undefined") {
    const storeIds = cart
      .map((item) => item.store_id)
      .filter((id): id is number => id !== undefined);
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("cart_store_ids", JSON.stringify(storeIds));
  }
};

// Load cart from localStorage
const loadFromLocalStorage = (): CartItem[] => {
  if (typeof window !== "undefined") {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
      return [];
    }
  }
  return [];
};

// Calculate total price
const calculateTotalPrice = (cart: CartItem[]): number => {
  return cart.reduce(
    (acc, item) => acc + (item.specialPrice ?? item.price) * item.quantity,
    0
  );
};

// ---------------- Initial State ---------------- //
const initialState: CartState = {
  cart: loadFromLocalStorage(),
  totalPrice: calculateTotalPrice(loadFromLocalStorage()),
};

// ---------------- Slice ---------------- //
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const existingItem = state.cart.find((i) => i.id === item.id);

      if (!existingItem) {
        state.cart.push({ ...item });
      } else {
        toast.error("Item already in cart.");
      }

      state.totalPrice = calculateTotalPrice(state.cart);
      saveToLocalStorage(state.cart);
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
      state.totalPrice = calculateTotalPrice(state.cart);
      saveToLocalStorage(state.cart);
      toast.info("Item removed from cart.");
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const item = state.cart.find((i) => i.id === id);

      if (item) {
        if (quantity > 0) {
          item.quantity = quantity;
        } else {
          // If quantity = 0, remove item
          state.cart = state.cart.filter((i) => i.id !== id);
          toast.info("Item removed from cart.");
        }
      }

      state.totalPrice = calculateTotalPrice(state.cart);
      saveToLocalStorage(state.cart);
    },

    clearCart: (state) => {
      state.cart = [];
      state.totalPrice = 0;

      if (typeof window !== "undefined") {
        localStorage.removeItem("cart");
        localStorage.removeItem("cart_store_ids");
      }

      // toast.info("Cart cleared.");
    },
  },
});

// ---------------- Exports ---------------- //
export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
