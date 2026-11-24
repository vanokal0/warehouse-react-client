// store/slices/warehouseSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WarehouseData } from "../../typing";

export const networkSlice = createSlice({
  name: "network",
  initialState: [] as WarehouseData[],
  reducers: {
    setWarehouses: (_, action: PayloadAction<WarehouseData[]>) =>
      action.payload,
    addWarehouse: (state, action: PayloadAction<WarehouseData>) => {
      state.push(action.payload);
    },
    updateWarehouse: (state, action: PayloadAction<WarehouseData>) => {
      const idx = state.findIndex((w) => w.id === action.payload.id);
      if (idx !== -1) state[idx] = action.payload;
    },
    removeWarehouse: (state, action: PayloadAction<number>) => {
      return state.filter((w) => w.id !== action.payload);
    },
  },
});

export const { setWarehouses, addWarehouse, updateWarehouse, removeWarehouse } =
  networkSlice.actions;

export default networkSlice.reducer;
