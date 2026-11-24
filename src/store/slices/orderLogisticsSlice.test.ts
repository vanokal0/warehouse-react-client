import { describe, it, expect } from "vitest";
import reducer, {
  setSelectedOrder,
  toggleProductExpanded,
  setPlacements,
  setShipments,
  addPlacement,
  updatePlacement,
  deletePlacement,
  addShipment,
  updateShipment,
  deleteShipment,
} from "./orderLogisticsSlice";
import { makeOrder, makePlacement, makeShipment } from "../../test/fixtures";

const initial = reducer(undefined, { type: "@@INIT" });

describe("orderLogisticsSlice", () => {
  it("has empty initial state", () => {
    expect(initial).toEqual({
      selectedOrder: null,
      expandedProductIds: {},
      placements: {},
      shipments: {},
      refreshKey: 0,
    });
  });

  it("selecting an order resets expanded products", () => {
    const expanded = reducer(initial, toggleProductExpanded("p1"));
    const order = makeOrder();
    const state = reducer(expanded, setSelectedOrder(order));
    expect(state.selectedOrder).toEqual(order);
    expect(state.expandedProductIds).toEqual({});
  });

  it("toggles product expansion", () => {
    let state = reducer(initial, toggleProductExpanded("p1"));
    expect(state.expandedProductIds.p1).toBe(true);
    state = reducer(state, toggleProductExpanded("p1"));
    expect(state.expandedProductIds.p1).toBe(false);
  });

  describe("placements", () => {
    const pl1 = makePlacement({ number: "PL1" });
    const pl2 = makePlacement({ number: "PL2" });

    it("sets placements per product without touching refreshKey", () => {
      const state = reducer(initial, setPlacements({ productId: "p1", data: [pl1] }));
      expect(state.placements).toEqual({ p1: [pl1] });
      expect(state.refreshKey).toBe(0);
    });

    it("adds a placement to an empty and existing list", () => {
      let state = reducer(initial, addPlacement({ productId: "p1", data: pl1 }));
      state = reducer(state, addPlacement({ productId: "p1", data: pl2 }));
      expect(state.placements.p1).toEqual([pl1, pl2]);
      expect(state.refreshKey).toBe(2);
    });

    it("updates a placement by number", () => {
      const seeded = reducer(initial, setPlacements({ productId: "p1", data: [pl1, pl2] }));
      const updated = { ...pl2, quantity: 99 };
      const state = reducer(seeded, updatePlacement({ productId: "p1", data: updated }));
      expect(state.placements.p1).toEqual([pl1, updated]);
      expect(state.refreshKey).toBe(1);
    });

    it("update on unknown product yields empty list", () => {
      const state = reducer(initial, updatePlacement({ productId: "x", data: pl1 }));
      expect(state.placements.x).toEqual([]);
    });

    it("deletes a placement by number", () => {
      const seeded = reducer(initial, setPlacements({ productId: "p1", data: [pl1, pl2] }));
      const state = reducer(seeded, deletePlacement({ productId: "p1", id: "PL1" }));
      expect(state.placements.p1).toEqual([pl2]);
      expect(state.refreshKey).toBe(1);
      expect(reducer(initial, deletePlacement({ productId: "x", id: "PL1" })).placements.x).toEqual([]);
    });
  });

  describe("shipments", () => {
    const sh1 = makeShipment({ number: "SH1" });
    const sh2 = makeShipment({ number: "SH2" });

    it("sets shipments per product", () => {
      const state = reducer(initial, setShipments({ productId: "p1", data: [sh1] }));
      expect(state.shipments).toEqual({ p1: [sh1] });
    });

    it("adds shipments", () => {
      let state = reducer(initial, addShipment({ productId: "p1", data: sh1 }));
      state = reducer(state, addShipment({ productId: "p1", data: sh2 }));
      expect(state.shipments.p1).toEqual([sh1, sh2]);
      expect(state.refreshKey).toBe(2);
    });

    it("updates a shipment by number", () => {
      const seeded = reducer(initial, setShipments({ productId: "p1", data: [sh1, sh2] }));
      const updated = { ...sh1, quantity: 1 };
      const state = reducer(seeded, updateShipment({ productId: "p1", data: updated }));
      expect(state.shipments.p1).toEqual([updated, sh2]);
      expect(reducer(initial, updateShipment({ productId: "x", data: sh1 })).shipments.x).toEqual([]);
    });

    it("deletes a shipment by number", () => {
      const seeded = reducer(initial, setShipments({ productId: "p1", data: [sh1, sh2] }));
      const state = reducer(seeded, deleteShipment({ productId: "p1", id: "SH2" }));
      expect(state.shipments.p1).toEqual([sh1]);
      expect(state.refreshKey).toBe(1);
      expect(reducer(initial, deleteShipment({ productId: "x", id: "SH1" })).shipments.x).toEqual([]);
    });
  });
});
