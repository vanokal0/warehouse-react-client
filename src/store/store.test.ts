import { describe, it, expect } from "vitest";
import { store } from "./store";

describe("store", () => {
  it("registers all slice reducers", () => {
    expect(Object.keys(store.getState()).sort()).toEqual(
      [
        "auth",
        "lotBooking",
        "modal",
        "network",
        "orderLogistics",
        "orderView",
        "popover",
        "warehouse",
      ].sort()
    );
  });
});
