import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrderData, ProductData } from "../../typing";

type OrderViewState = {
  mode: "order" | "viewProduct" | "createProduct";
  selectedProduct: ProductData | null;
  currentOrder: OrderData | null;
  refreshTableCounter: number;
  isEditing: boolean;
  isDeleting: boolean;
};

const initialState: OrderViewState = {
  mode: "order",
  selectedProduct: null,
  currentOrder: null,
  refreshTableCounter: 0,
  isEditing: true,
  isDeleting: false,
};

export const orderViewSlice = createSlice({
  name: "orderView",
  initialState,
  reducers: {
    setOrder: (state, action: PayloadAction<OrderData | null>) => {
      state.currentOrder = action.payload;
      state.mode = "order";
      state.selectedProduct = null;
      state.isEditing = false;
    },
    createProduct: (state) => {
      state.mode = "createProduct";
      state.selectedProduct = null;
    },
    viewProduct: (state, action: PayloadAction<ProductData>) => {
      state.mode = "viewProduct";
      state.selectedProduct = action.payload;
    },
    backToOrder: (state) => {
      state.mode = "order";
      state.selectedProduct = null;
    },
    addProductToOrder: (state, action: PayloadAction<ProductData>) => {
      if (!state.currentOrder) return;

      state.currentOrder.products.push({
        orderNumber: state.currentOrder.number,
        concreteProduct: action.payload,
        quantity: 1,
      });
      state.refreshTableCounter++;
    },
    updateProductInOrder: (state, action: PayloadAction<ProductData>) => {
      if (!state.currentOrder) return;

      const index = state.currentOrder.products.findIndex(
        (item) => item.concreteProduct.id === action.payload.id
      );

      if (index !== -1) {
        state.currentOrder.products[index].concreteProduct = action.payload;
        state.refreshTableCounter++;
      }
    },
    triggerTableRefresh: (state) => {
      state.refreshTableCounter++;
    },
    setEditingOrder: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload;
    },
    setDeleteMode: (state, action: PayloadAction<boolean>) => {
      state.isDeleting = action.payload;
    },
  },
});

export const {
  setOrder,
  createProduct,
  viewProduct,
  backToOrder,
  addProductToOrder,
  updateProductInOrder,
  triggerTableRefresh,
  setEditingOrder,
  setDeleteMode,
} = orderViewSlice.actions;
export default orderViewSlice.reducer;
