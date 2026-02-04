"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StoreState {
  selectedStore: {
    id: string | null;
    type?: string | null;
    slug: string | null;
  };
}

const getInitialSelectedStore = (): {
  id: string | null;
  type: string | null;
  slug: string | null;
} => {
  if (typeof window !== "undefined") {
    const storedStore = localStorage.getItem("selectedStore");
    return storedStore
      ? JSON.parse(storedStore)
      : { id: null, type: null, slug: null };
  }
  return { id: null, type: null, slug: null };
};

const initialState: StoreState = {
  selectedStore: getInitialSelectedStore(),
};

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setSelectedStore(
      state,
      action: PayloadAction<{ id: string; type: string; slug: string }>
    ) {
      state.selectedStore = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedStore", JSON.stringify(action.payload));
      }
    },
    hydrateSelectedStore(state) {
      if (typeof window !== "undefined") {
        const storedStore = localStorage.getItem("selectedStore");
        state.selectedStore = storedStore
          ? JSON.parse(storedStore)
          : { id: null, type: null, slug: null };
      }
    },
  },
});

export const { setSelectedStore, hydrateSelectedStore } = storeSlice.actions;
export default storeSlice.reducer;