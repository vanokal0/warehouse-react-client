import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthState = {
  employeeId: number | null;
  warehouseNumber: string | null;
  role: string | null;
  isAuthenticated: boolean;
  fullName: string | null;
};

const initialState: AuthState = {
  employeeId: null,
  warehouseNumber: null,
  role: null,
  isAuthenticated: false,
  fullName: null,
};

export type AuthPayload = {
  employeeId: number;
  warehouseNumber: string;
  role: string;
  fullName: string;
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<AuthPayload>) {
      const { employeeId, warehouseNumber, role, fullName } = action.payload;
      state.employeeId = employeeId;
      state.warehouseNumber = warehouseNumber;
      state.role = role;
      state.fullName = fullName;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.employeeId = null;
      state.warehouseNumber = null;
      state.role = null;
      state.isAuthenticated = false;
    },
    loadFromStorage(state) {
      const raw = localStorage.getItem("user");
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as AuthPayload;
          state.employeeId = parsed.employeeId;
          state.warehouseNumber = parsed.warehouseNumber;
          state.role = parsed.role;
          state.isAuthenticated = true;
        } catch {
          localStorage.removeItem("user");
        }
      }
    },
  },
});

export const { login, logout, loadFromStorage } = authSlice.actions;
export default authSlice.reducer;
