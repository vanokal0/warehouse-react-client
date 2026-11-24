import { describe, it, expect } from "vitest";
import reducer, {
  setOrder,
  createProduct,
  viewProduct,
  backToOrder,
  addProductToOrder,
  updateProductInOrder,
  triggerTableRefresh,
  setEditingOrder,
  setDeleteMode,
} from "./orderViewSlice";
import { makeOrder, makeProduct } from "../../test/fixtures";

const initial = reducer(undefined, { type: "@@INIT" });

describe("orderViewSlice", () => {
  it("has expected initial state", () => {
    expect(initial).toEqual({
      mode: "order",
      selectedProduct: null,
      currentOrder: null,
      refreshTableCounter: 0,
      isEditing: true,
      isDeleting: false,
    });
  });

  it("setOrder resets view to order mode and disables editing", () => {
    const viewing = reducer(initial, viewProduct(makeProduct()));
    const order = makeOrder();
    const state = reducer(viewing, setOrder(order));
    expect(state).toMatchObject({
      currentOrder: order,
      mode: "order",
      selectedProduct: null,
      isEditing: false,
    });
    expect(reducer(state, setOrder(null)).currentOrder).toBeNull();
  });

  it("switches between product modes", () => {
    const product = makeProduct();
    let state = reducer(initial, viewProduct(product));
    expect(state).toMatchObject({ mode: "viewProduct", selectedProduct: product });

    state = reducer(state, createProduct());
    expect(state).toMatchObject({ mode: "createProduct", selectedProduct: null });

    state = reducer(reducer(state, viewProduct(product)), backToOrder());
    expect(state).toMatchObject({ mode: "order", selectedProduct: null });
  });

  describe("addProductToOrder", () => {
    it("does nothing without a current order", () => {
      expect(reducer(initial, addProductToOrder(makeProduct()))).toEqual(initial);
    });

    it("appends product with quantity 1 and bumps refresh counter", () => {
      const product = makeProduct({ id: 5 });
      const withOrder = reducer(initial, setOrder(makeOrder({ number: "ORD-9" })));
      const state = reducer(withOrder, addProductToOrder(product));
      expect(state.currentOrder?.products).toEqual([
        { orderNumber: "ORD-9", concreteProduct: product, quantity: 1 },
      ]);
      expect(state.refreshTableCounter).toBe(1);
    });
  });

  describe("updateProductInOrder", () => {
    const product = makeProduct({ id: 5 });
    const order = makeOrder({
      products: [{ orderNumber: "ORD-1", concreteProduct: product, quantity: 4 }],
    });

    it("does nothing without a current order", () => {
      expect(reducer(initial, updateProductInOrder(product))).toEqual(initial);
    });

    it("replaces matching product and bumps counter", () => {
      const updated = { ...product, value: 42 };
      const state = reducer(reducer(initial, setOrder(order)), updateProductInOrder(updated));
      expect(state.currentOrder?.products[0]).toEqual({
        orderNumber: "ORD-1",
        concreteProduct: updated,
        quantity: 4,
      });
      expect(state.refreshTableCounter).toBe(1);
    });

    it("ignores unknown product", () => {
      const withOrder = reducer(initial, setOrder(order));
      const state = reducer(withOrder, updateProductInOrder(makeProduct({ id: 999 })));
      expect(state).toEqual(withOrder);
    });
  });

  it("triggers table refresh and toggles flags", () => {
    let state = reducer(initial, triggerTableRefresh());
    expect(state.refreshTableCounter).toBe(1);
    state = reducer(state, setEditingOrder(false));
    expect(state.isEditing).toBe(false);
    state = reducer(state, setDeleteMode(true));
    expect(state.isDeleting).toBe(true);
  });
});
