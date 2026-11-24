import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  WarehouseData,
  RoomData,
  ParkingLotData,
  EmployeeData,
} from "../../typing";

interface WarehouseState {
  selectedWarehouse: WarehouseData | null;
}

const initialState: WarehouseState = {
  selectedWarehouse: null,
};

export const warehouseSlice = createSlice({
  name: "warehouse",
  initialState,
  reducers: {
    setWarehouse: (state, action: PayloadAction<WarehouseData>) => {
      state.selectedWarehouse = action.payload;
    },
    updateRoom: (state, action: PayloadAction<RoomData>) => {
      if (!state.selectedWarehouse) return;
      const updatedRoom = action.payload;
      state.selectedWarehouse.rooms = state.selectedWarehouse.rooms.map(
        (room) => (room.number === updatedRoom.number ? updatedRoom : room)
      );
    },
    addRoom: (state, action: PayloadAction<RoomData>) => {
      if (!state.selectedWarehouse) return;
      state.selectedWarehouse.rooms.push(action.payload);
    },
    removeRoom: (state, action: PayloadAction<string>) => {
      if (!state.selectedWarehouse) return;
      state.selectedWarehouse.rooms = state.selectedWarehouse.rooms.filter(
        (room) => room.number !== action.payload
      );
    },

    updateParkingLot: (state, action: PayloadAction<ParkingLotData>) => {
      if (!state.selectedWarehouse) return;
      const updatedLot = action.payload;

      if (
        !state.selectedWarehouse.loadingDocks.find(
          (dock) => dock.number === updatedLot.dockNumber
        )
      ) {
        state.selectedWarehouse.loadingDocks.push({
          number: updatedLot.number,
          parkingLots: [updatedLot],
        });
      }

      state.selectedWarehouse.loadingDocks =
        state.selectedWarehouse.loadingDocks.map((dock) => ({
          ...dock,
          parkingLots: dock.parkingLots.map((lot) =>
            lot.number === updatedLot.number ? updatedLot : lot
          ),
        }));
    },
    addParkingLot: (state, action: PayloadAction<ParkingLotData>) => {
      if (!state.selectedWarehouse) return;
      const targetDock = state.selectedWarehouse.loadingDocks.find(
        (dock) => dock.number === action.payload.number
      );
      if (targetDock) {
        targetDock.parkingLots.push(action.payload);
      } else {
        state.selectedWarehouse.loadingDocks.push({
          number: action.payload.dockNumber,
          parkingLots: [action.payload],
        });
      }
    },
    removeParkingLot: (state, action: PayloadAction<string>) => {
      if (!state.selectedWarehouse) return;
      state.selectedWarehouse.loadingDocks =
        state.selectedWarehouse.loadingDocks.map((dock) => ({
          ...dock,
          parkingLots: dock.parkingLots.filter(
            (lot) => lot.number !== action.payload
          ),
        }));
    },

    updateEmployee: (state, action: PayloadAction<EmployeeData>) => {
      if (!state.selectedWarehouse) return;
      const updatedEmployee = action.payload;
      state.selectedWarehouse.employees = state.selectedWarehouse.employees.map(
        (emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)
      );
    },
    addEmployee: (state, action: PayloadAction<EmployeeData>) => {
      if (!state.selectedWarehouse) return;
      state.selectedWarehouse.employees.push(action.payload);
    },
    removeEmployee: (state, action: PayloadAction<string>) => {
      if (!state.selectedWarehouse) return;
      state.selectedWarehouse.employees =
        state.selectedWarehouse.employees.filter(
          (emp) => emp.fullName !== action.payload
        );
    },
  },
});

export const {
  setWarehouse,
  updateRoom,
  addRoom,
  removeRoom,
  updateParkingLot,
  addParkingLot,
  removeParkingLot,
  updateEmployee,
  addEmployee,
  removeEmployee,
} = warehouseSlice.actions;

export default warehouseSlice.reducer;
