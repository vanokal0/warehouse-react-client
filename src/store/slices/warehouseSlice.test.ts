import { describe, it, expect } from "vitest";
import reducer, {
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
} from "./warehouseSlice";
import {
  makeEmployee,
  makeParkingLot,
  makeRoom,
  makeWarehouse,
} from "../../test/fixtures";

const initial = reducer(undefined, { type: "@@INIT" });
const withWarehouse = () => reducer(initial, setWarehouse(makeWarehouse()));

describe("warehouseSlice", () => {
  it("has no selected warehouse initially", () => {
    expect(initial).toEqual({ selectedWarehouse: null });
  });

  it("sets the selected warehouse", () => {
    const w = makeWarehouse();
    expect(reducer(initial, setWarehouse(w)).selectedWarehouse).toEqual(w);
  });

  it.each([
    ["updateRoom", updateRoom(makeRoom())],
    ["addRoom", addRoom(makeRoom())],
    ["removeRoom", removeRoom("R1")],
    ["updateParkingLot", updateParkingLot(makeParkingLot())],
    ["addParkingLot", addParkingLot(makeParkingLot())],
    ["removeParkingLot", removeParkingLot("P1")],
    ["updateEmployee", updateEmployee(makeEmployee())],
    ["addEmployee", addEmployee(makeEmployee())],
    ["removeEmployee", removeEmployee("John Doe")],
  ])("%s is a no-op without selected warehouse", (_, action) => {
    expect(reducer(initial, action)).toEqual(initial);
  });

  describe("rooms", () => {
    it("updates a room by number", () => {
      const updated = makeRoom({ availableSpace: 1 });
      const other = makeRoom({ number: "R2" });
      let state = reducer(withWarehouse(), addRoom(other));
      state = reducer(state, updateRoom(updated));
      expect(state.selectedWarehouse?.rooms).toEqual([updated, other]);
    });

    it("adds and removes rooms", () => {
      const r2 = makeRoom({ number: "R2" });
      let state = reducer(withWarehouse(), addRoom(r2));
      expect(state.selectedWarehouse?.rooms.map((r) => r.number)).toEqual(["R1", "R2"]);
      state = reducer(state, removeRoom("R1"));
      expect(state.selectedWarehouse?.rooms).toEqual([r2]);
    });
  });

  describe("parking lots", () => {
    it("updates a lot within its existing dock", () => {
      const updated = makeParkingLot({ type: "Van" });
      const state = reducer(withWarehouse(), updateParkingLot(updated));
      expect(state.selectedWarehouse?.loadingDocks).toEqual([
        { number: "D1", parkingLots: [updated] },
      ]);
    });

    it("creates a new dock when updated lot references an unknown dock", () => {
      const moved = makeParkingLot({ number: "P9", dockNumber: "D2" });
      const state = reducer(withWarehouse(), updateParkingLot(moved));
      expect(state.selectedWarehouse?.loadingDocks).toHaveLength(2);
      expect(state.selectedWarehouse?.loadingDocks[1].parkingLots).toEqual([moved]);
    });

    it.fails("known bug: new dock created on update is numbered by lot number instead of dockNumber", () => {
      const moved = makeParkingLot({ number: "P9", dockNumber: "D2" });
      const state = reducer(withWarehouse(), updateParkingLot(moved));
      expect(state.selectedWarehouse?.loadingDocks[1].number).toBe("D2");
    });

    it("adds a lot to a new dock when dock is missing", () => {
      const lot = makeParkingLot({ number: "P2", dockNumber: "D2" });
      const state = reducer(withWarehouse(), addParkingLot(lot));
      expect(state.selectedWarehouse?.loadingDocks[1]).toEqual({
        number: "D2",
        parkingLots: [lot],
      });
    });

    it.fails("known bug: addParkingLot looks up dock by lot number instead of dockNumber", () => {
      const lot = makeParkingLot({ number: "P2", dockNumber: "D1" });
      const state = reducer(withWarehouse(), addParkingLot(lot));
      expect(state.selectedWarehouse?.loadingDocks).toHaveLength(1);
      expect(state.selectedWarehouse?.loadingDocks[0].parkingLots).toHaveLength(2);
    });

    it("adds to an existing dock whose number matches the lot number", () => {
      const lot = makeParkingLot({ number: "D1", dockNumber: "D1" });
      const state = reducer(withWarehouse(), addParkingLot(lot));
      expect(state.selectedWarehouse?.loadingDocks[0].parkingLots).toHaveLength(2);
    });

    it("removes a lot from every dock", () => {
      const state = reducer(withWarehouse(), removeParkingLot("P1"));
      expect(state.selectedWarehouse?.loadingDocks).toEqual([{ number: "D1", parkingLots: [] }]);
    });
  });

  describe("employees", () => {
    it("updates an employee by id", () => {
      const updated = makeEmployee({ position: "Manager" });
      const other = makeEmployee({ id: 2, fullName: "Jane Roe" });
      let state = reducer(withWarehouse(), addEmployee(other));
      state = reducer(state, updateEmployee(updated));
      expect(state.selectedWarehouse?.employees).toEqual([updated, other]);
    });

    it("adds and removes employees by full name", () => {
      const jane = makeEmployee({ id: 2, fullName: "Jane Roe" });
      let state = reducer(withWarehouse(), addEmployee(jane));
      expect(state.selectedWarehouse?.employees).toHaveLength(2);
      state = reducer(state, removeEmployee("John Doe"));
      expect(state.selectedWarehouse?.employees).toEqual([jane]);
    });
  });
});
