import { describe, it, expect, vi } from "vitest";
import reducer, { login, logout, loadFromStorage, AuthPayload, AuthState } from "./authSlice";

const payload: AuthPayload = {
  employeeId: 7,
  warehouseNumber: "W1",
  role: "Operator",
  fullName: "John Doe",
};

const initial = reducer(undefined, { type: "@@INIT" });

describe("authSlice", () => {
  it("has unauthenticated initial state", () => {
    expect(initial).toEqual<AuthState>({
      employeeId: null,
      warehouseNumber: null,
      role: null,
      isAuthenticated: false,
      fullName: null,
    });
  });

  it("login stores user data and authenticates", () => {
    expect(reducer(initial, login(payload))).toEqual({ ...payload, isAuthenticated: true });
  });

  it("logout clears identity and authentication flag", () => {
    const state = reducer(reducer(initial, login(payload)), logout());
    expect(state.employeeId).toBeNull();
    expect(state.warehouseNumber).toBeNull();
    expect(state.role).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it.fails("known bug: logout does not clear fullName", () => {
    const state = reducer(reducer(initial, login(payload)), logout());
    expect(state.fullName).toBeNull();
  });

  describe("loadFromStorage", () => {
    it("restores user from localStorage", () => {
      localStorage.setItem("user", JSON.stringify(payload));
      const state = reducer(initial, loadFromStorage());
      expect(state).toMatchObject({
        employeeId: 7,
        warehouseNumber: "W1",
        role: "Operator",
        isAuthenticated: true,
      });
    });

    it.fails("known bug: does not restore fullName", () => {
      localStorage.setItem("user", JSON.stringify(payload));
      expect(reducer(initial, loadFromStorage()).fullName).toBe("John Doe");
    });

    it("keeps state unchanged when nothing is stored", () => {
      expect(reducer(initial, loadFromStorage())).toEqual(initial);
    });

    it("removes corrupted entry and keeps state unchanged", () => {
      localStorage.setItem("user", "{not-json");
      const removeSpy = vi.spyOn(Storage.prototype, "removeItem");
      const state = reducer(initial, loadFromStorage());
      expect(state).toEqual(initial);
      expect(removeSpy).toHaveBeenCalledWith("user");
      expect(localStorage.getItem("user")).toBeNull();
      removeSpy.mockRestore();
    });
  });
});
