import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StripeSecretKeyState {
  isRefetch: boolean;
  stripeSecretKey: string | null;
}

const initialState: StripeSecretKeyState = {
  isRefetch: false,
  stripeSecretKey: null,
  
};

const stripeSecretKeySlice = createSlice({
  name: "refetchValue",
  initialState,
  reducers: {
    setRefetch(state, action: PayloadAction<boolean>) {
      state.isRefetch = action.payload;
    },
    setStripeSecretKey(state, action: PayloadAction<string | null>) {
      state.stripeSecretKey = action.payload; // Update dynamic value
    },
  },
});

export const { setRefetch, setStripeSecretKey  } = stripeSecretKeySlice.actions;

export default stripeSecretKeySlice.reducer;
