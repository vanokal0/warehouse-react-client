import { describe, it, expect } from "vitest";
import reducer, { showPopover, hidePopover } from "./popoverSlice";
import { makeProduct } from "../../test/fixtures";

const products = [{ orderNumber: "ORD-1", concreteProduct: makeProduct(), quantity: 3 }];

describe("popoverSlice", () => {
  it("is hidden initially", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual({ products: null, position: null });
  });

  it("shows and hides popover", () => {
    const shown = reducer(undefined, showPopover({ products, position: { x: 5, y: 10 } }));
    expect(shown).toEqual({ products, position: { x: 5, y: 10 } });
    expect(reducer(shown, hidePopover())).toEqual({ products: null, position: null });
  });
});
