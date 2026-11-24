import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrderProductData } from "../../typing";

type PopoverState = {
  products: OrderProductData[] | null;
  position: { x: number; y: number } | null;
};

const initialState: PopoverState = {
  products: null,
  position: null,
};

export const productPopoverSlice = createSlice({
  name: "productPopover",
  initialState,
  reducers: {
    showPopover: (
      state,
      action: PayloadAction<{
        products: OrderProductData[];
        position: { x: number; y: number };
      }>
    ) => {
      state.products = action.payload.products;
      state.position = action.payload.position;
    },
    hidePopover: (state) => {
      state.products = null;
      state.position = null;
    },
  },
});

export const { showPopover, hidePopover } = productPopoverSlice.actions;
export default productPopoverSlice.reducer;
