import { describe, it, expect } from "vitest";
import reducer, {
  setSelectedLotNumber,
  clearSelectedLotNumber,
  triggerLotBookingsRefresh,
} from "./lotBookingSlice";

const initial = reducer(undefined, { type: "@@INIT" });

describe("lotBookingSlice", () => {
  it("has empty initial state", () => {
    expect(initial).toEqual({ selectedLotNumber: null, refreshKey: 0 });
  });

  it("sets and clears selected lot number", () => {
    const selected = reducer(initial, setSelectedLotNumber("L42"));
    expect(selected.selectedLotNumber).toBe("L42");
    expect(reducer(selected, clearSelectedLotNumber()).selectedLotNumber).toBeNull();
  });

  it("increments refresh key on every trigger", () => {
    let state = reducer(initial, triggerLotBookingsRefresh());
    state = reducer(state, triggerLotBookingsRefresh());
    expect(state.refreshKey).toBe(2);
  });
});
