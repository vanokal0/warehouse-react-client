import { describe, it, expect } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ProductPopover from "./ProductPopover";
import popoverReducer, { showPopover, hidePopover } from "../../store/slices/popoverSlice";
import { makeProduct } from "../../test/fixtures";

const setup = () => {
  const store = configureStore({ reducer: { popover: popoverReducer } });
  render(
    <Provider store={store}>
      <ProductPopover />
    </Provider>
  );
  return store;
};

describe("ProductPopover", () => {
  it("renders nothing when hidden", () => {
    setup();
    expect(screen.queryByText("Продукти в замовлені:")).not.toBeInTheDocument();
  });

  it("renders products into body at offset position and hides again", () => {
    const store = setup();
    act(() => {
      store.dispatch(
        showPopover({
          products: [
            { orderNumber: "O1", concreteProduct: makeProduct(), quantity: 3 },
            {
              orderNumber: "O1",
              concreteProduct: makeProduct({ id: 2, concreteProductName: "Juice", value: 4 }),
              quantity: 1,
            },
          ],
          position: { x: 100, y: 50 },
        })
      );
    });

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Cola 0.5L — 2$, 3 шт.");
    expect(items[1]).toHaveTextContent("Juice — 4$, 1 шт.");

    const container = screen.getByText("Продукти в замовлені:").parentElement!;
    expect(container.parentElement).toBe(document.body);
    expect(container).toHaveStyle({ top: "60px", left: "110px" });

    act(() => {
      store.dispatch(hidePopover());
    });
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
