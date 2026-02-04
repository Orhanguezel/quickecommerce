import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RefetchState {
  isRefetch: boolean;
  dynamicValue: string | null;
}

const initialState: RefetchState = {
  isRefetch: false,
  dynamicValue: null,
  
};

const refetchSlice = createSlice({
  name: "refetchValue",
  initialState,
  reducers: {
    setRefetch(state, action: PayloadAction<boolean>) {
      state.isRefetch = action.payload;
    },
    setDynamicValue(state, action: PayloadAction<string | null>) {
      state.dynamicValue = action.payload; // Update dynamic value
    },
  },
});

export const { setRefetch, setDynamicValue  } = refetchSlice.actions;

export default refetchSlice.reducer;
