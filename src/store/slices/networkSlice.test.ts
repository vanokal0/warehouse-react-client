import { describe, it, expect } from "vitest";
import reducer, {
  setWarehouses,
  addWarehouse,
  updateWarehouse,
  removeWarehouse,
} from "./networkSlice";
import { makeWarehouse } from "../../test/fixtures";

const w1 = makeWarehouse({ id: 1, number: "W1" });
const w2 = makeWarehouse({ id: 2, number: "W2" });

describe("networkSlice", () => {
  it("starts with an empty list", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual([]);
  });

  it("replaces the list with setWarehouses", () => {
    expect(reducer([w1], setWarehouses([w2]))).toEqual([w2]);
  });

  it("appends a warehouse", () => {
    expect(reducer([w1], addWarehouse(w2))).toEqual([w1, w2]);
  });

  it("updates an existing warehouse by id", () => {
    const updated = { ...w1, address: "New address" };
    expect(reducer([w1, w2], updateWarehouse(updated))).toEqual([updated, w2]);
  });

  it("ignores updates for unknown ids", () => {
    const unknown = makeWarehouse({ id: 99 });
    expect(reducer([w1], updateWarehouse(unknown))).toEqual([w1]);
  });

  it("removes a warehouse by id", () => {
    expect(reducer([w1, w2], removeWarehouse(1))).toEqual([w2]);
    expect(reducer([w1], removeWarehouse(99))).toEqual([w1]);
  });
});
