"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CouponState {
  couponId: string | null;
}

const getInitialCouponId = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("couponId");
  }
  return null;
};

const initialState: CouponState = {
  couponId: getInitialCouponId(),
};

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    setCouponId(state, action: PayloadAction<string | null>) {
      state.couponId = action.payload;

      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem("couponId", action.payload);
        } else {
          localStorage.removeItem("couponId");
        }
      }
    },
    hydrateCouponId(state) {
      if (typeof window !== "undefined") {
        state.couponId = localStorage.getItem("couponId");
      }
    },
  },
});

export const { setCouponId, hydrateCouponId } = couponSlice.actions;
export default couponSlice.reducer;
