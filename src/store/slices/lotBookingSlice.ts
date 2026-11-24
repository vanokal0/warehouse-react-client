// store/slices/lotBookingSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const lotBookingSlice = createSlice({
  name: "lotBooking",
  initialState: {
    selectedLotNumber: null as string | null,
    refreshKey: 0,
  },
  reducers: {
    setSelectedLotNumber: (state, action: PayloadAction<string>) => {
      state.selectedLotNumber = action.payload;
    },
    clearSelectedLotNumber: (state) => {
      state.selectedLotNumber = null;
    },
    triggerLotBookingsRefresh: (state) => {
      state.refreshKey += 1;
    },
  },
});

export const {
  setSelectedLotNumber,
  clearSelectedLotNumber,
  triggerLotBookingsRefresh,
} = lotBookingSlice.actions;
export default lotBookingSlice.reducer;
