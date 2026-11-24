import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./slices/modalSlice";
import productPopoverReducer from "./slices/popoverSlice";
import logisticsReducer from "./slices/orderLogisticsSlice";
import lotBookingReducer from "./slices/lotBookingSlice";
import orderViewReducer from "./slices/orderViewSlice";
import warehouseReducer from "./slices/warehouseSlice";
import networkReducer from "./slices/networkSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    modal: modalReducer,
    popover: productPopoverReducer,
    orderLogistics: logisticsReducer,
    lotBooking: lotBookingReducer,
    orderView: orderViewReducer,
    warehouse: warehouseReducer,
    network: networkReducer,
    auth: authReducer,
  },
});

// Типізація RootState і AppDispatch для коректної роботи з useSelector/useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
