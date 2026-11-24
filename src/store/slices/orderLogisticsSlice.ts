// store/slices/orderLogisticsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  OrderData,
  ProductPlacementData,
  ProductShipmentData,
} from "../../typing";

type LogisticsState = {
  selectedOrder: OrderData | null;
  expandedProductIds: Record<string, boolean>;
  placements: Record<string, ProductPlacementData[]>;
  shipments: Record<string, ProductShipmentData[]>;
  refreshKey: number;
};

const initialState: LogisticsState = {
  selectedOrder: null,
  expandedProductIds: {},
  placements: {},
  shipments: {},
  refreshKey: 0,
};

export const logisticsSlice = createSlice({
  name: "orderLogistics",
  initialState,
  reducers: {
    setSelectedOrder(state, action: PayloadAction<OrderData>) {
      state.selectedOrder = action.payload;
      state.expandedProductIds = {};
    },
    toggleProductExpanded(state, action: PayloadAction<string>) {
      const productId = action.payload;
      state.expandedProductIds[productId] =
        !state.expandedProductIds[productId];
    },
    setPlacements(
      state,
      action: PayloadAction<{ productId: string; data: ProductPlacementData[] }>
    ) {
      state.placements[action.payload.productId] = action.payload.data;
    },
    setShipments(
      state,
      action: PayloadAction<{ productId: string; data: ProductShipmentData[] }>
    ) {
      state.shipments[action.payload.productId] = action.payload.data;
    },
    addPlacement(
      state,
      action: PayloadAction<{ productId: string; data: ProductPlacementData }>
    ) {
      const arr = state.placements[action.payload.productId] ?? [];
      state.placements[action.payload.productId] = [
        ...arr,
        action.payload.data,
      ];
      state.refreshKey++;
    },
    updatePlacement(
      state,
      action: PayloadAction<{ productId: string; data: ProductPlacementData }>
    ) {
      const arr = state.placements[action.payload.productId] ?? [];
      state.placements[action.payload.productId] = arr.map((p) =>
        p.number === action.payload.data.number ? action.payload.data : p
      );
      state.refreshKey++;
    },
    deletePlacement(
      state,
      action: PayloadAction<{ productId: string; id: string }>
    ) {
      const arr = state.placements[action.payload.productId] ?? [];
      state.placements[action.payload.productId] = arr.filter(
        (p) => p.number !== action.payload.id
      );
      state.refreshKey++;
    },

    addShipment(
      state,
      action: PayloadAction<{ productId: string; data: ProductShipmentData }>
    ) {
      const arr = state.shipments[action.payload.productId] ?? [];
      state.shipments[action.payload.productId] = [...arr, action.payload.data];
      state.refreshKey++;
    },
    updateShipment(
      state,
      action: PayloadAction<{ productId: string; data: ProductShipmentData }>
    ) {
      const arr = state.shipments[action.payload.productId] ?? [];
      state.shipments[action.payload.productId] = arr.map((s) =>
        s.number === action.payload.data.number ? action.payload.data : s
      );
      state.refreshKey++;
    },
    deleteShipment(
      state,
      action: PayloadAction<{ productId: string; id: string }>
    ) {
      const arr = state.shipments[action.payload.productId] ?? [];
      state.shipments[action.payload.productId] = arr.filter(
        (s) => s.number !== action.payload.id
      );
      state.refreshKey++;
    },
  },
});

export const {
  setSelectedOrder,
  toggleProductExpanded,
  setPlacements,
  setShipments,
  addShipment,
  addPlacement,
  updateShipment,
  updatePlacement,
  deleteShipment,
  deletePlacement,
} = logisticsSlice.actions;

export default logisticsSlice.reducer;
