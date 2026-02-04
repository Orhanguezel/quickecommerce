import { configureStore } from "@reduxjs/toolkit";
import storeReducer from "../slices/storeSlice";
import cartReducer from "@/redux/slices/cartSlice";
import couponReducer from "../slices/couponSlice";
import refetchReducer from "../slices/refetchSlice";
import stripeSecretKeyReducer from "../slices/stripeSecretKeySlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    store: storeReducer,
    coupon: couponReducer,
    refetchValue: refetchReducer,
    stripeSecretKeyValue: stripeSecretKeyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
