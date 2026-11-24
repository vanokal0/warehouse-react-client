import { describe, it, expect, vi } from "vitest";
import reducer, {
  openModal,
  closeModal,
  switchToEdit,
  switchToDelete,
  backToView,
  triggerFormReset,
  acknowledgeReset,
  createNewEntity,
  setWarehouseNumber,
  setSelectedOrderProductType,
  modalEntityMap,
} from "./modalSlice";
import { makeEmployee, makePlacement, makeWarehouse } from "../../test/fixtures";

const API = import.meta.env.VITE_BACKEND_API_URL;
const initial = reducer(undefined, { type: "@@INIT" });

describe("modalSlice", () => {
  it("has expected initial state", () => {
    expect(initial).toMatchObject({
      isOpen: false,
      mode: "view",
      entity: null,
      formData: null,
      isResetRequired: false,
      isCreate: false,
      warehouseNumber: "MA759",
      selectedOrderProductType: "Beverages",
    });
    expect(typeof initial.modalHeader).toBe("string");
  });

  describe("modalEntityMap", () => {
    it.each([
      ["Warehouse", "warehouses"],
      ["Employee", "employees"],
      ["Room", "rooms"],
      ["Parking Lot", "parking-lots"],
      ["Product Placement", "product-placements"],
      ["Product Shipment", "product-shipments"],
      ["Lot Booking", "lot-bookings"],
    ])("%s uses /%s endpoints", (type, path) => {
      const data = modalEntityMap.get(type)!;
      expect(data.createUrl).toBe(`${API}/${path}`);
      expect(data.updateUrl).toBe(`${API}/${path}`);
      expect(data.deleteUrl).toBe(`${API}/${path}`);
      const names = data.attributes.map((a) => a.name);
      expect(names).toContain(data.fetchAttribute);
      expect(names).toContain(data.titleAttributte);
    });
  });

  describe("openModal", () => {
    it("opens in view mode and fills attribute values from entity", () => {
      const employee = makeEmployee();
      const state = reducer(initial, openModal({ entity: employee, type: "Employee" }));
      expect(state.isOpen).toBe(true);
      expect(state.mode).toBe("view");
      expect(state.entity).toEqual(employee);
      const values = Object.fromEntries(state.formData!.attributes.map((a) => [a.name, a.value]));
      expect(values).toEqual({
        id: 1,
        firstName: "John",
        lastName: "Doe",
        warehouseNumber: "W1",
        position: "Operator",
        fullName: "John Doe",
      });
    });

    it("substitutes warehouse and product type placeholders in option URLs", () => {
      let state = reducer(initial, setWarehouseNumber("W7"));
      state = reducer(state, setSelectedOrderProductType("Frozen"));
      state = reducer(state, openModal({ entity: makePlacement(), type: "Product Placement" }));
      const room = state.formData!.attributes.find((a) => a.name === "roomNumber")!;
      const booking = state.formData!.attributes.find((a) => a.name === "lotBookingNumber")!;
      expect(room.fetchOptionsUrl).toBe(
        `${API}/warehouses/rooms?warehouseNumber=W7&productType=Frozen`
      );
      expect(booking.fetchOptionsUrl).toBe(`${API}/lot-bookings/warehouse?warehouseNumber=W7`);
    });

    it("does not mutate the shared entity map", () => {
      reducer(initial, openModal({ entity: makePlacement(), type: "Product Placement" }));
      const room = modalEntityMap.get("Product Placement")!.attributes.find((a) => a.name === "roomNumber")!;
      expect(room.fetchOptionsUrl).toContain("__WAREHOUSE__");
      expect(room).not.toHaveProperty("value");
    });

    it("sets formData to null for unknown type", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const state = reducer(initial, openModal({ entity: makeWarehouse(), type: "Unknown" }));
      expect(state.formData).toBeNull();
      expect(state.isOpen).toBe(true);
      expect(logSpy).toHaveBeenCalledWith("NOT FOUND");
      logSpy.mockRestore();
    });
  });

  describe("createNewEntity", () => {
    it("opens in create/edit mode with initial attributes and header", () => {
      const state = reducer(
        initial,
        createNewEntity({
          type: "Room",
          headerText: "New room",
          initialAttributes: new Map([["warehouseNumber", "W1"]]),
        })
      );
      expect(state).toMatchObject({
        isOpen: true,
        mode: "edit",
        entity: null,
        isCreate: true,
        modalHeader: "New room",
      });
      const values = Object.fromEntries(state.formData!.attributes.map((a) => [a.name, a.value]));
      expect(values.warehouseNumber).toBe("W1");
      expect(values.type).toBe("");
    });

    it("defaults all values to empty string without initial attributes", () => {
      const state = reducer(
        reducer(initial, setWarehouseNumber("W3")),
        createNewEntity({ type: "Product Shipment", headerText: "h" })
      );
      expect(state.formData!.attributes.every((a) => a.value === "")).toBe(true);
      const employee = state.formData!.attributes.find((a) => a.name === "employee")!;
      expect(employee.fetchOptionsUrl).toBe(`${API}/warehouses/operators?warehouseNumber=W3`);
    });

    it("sets formData to null for unknown type", () => {
      const state = reducer(initial, createNewEntity({ type: "Nope", headerText: "h" }));
      expect(state.formData).toBeNull();
      expect(state.isCreate).toBe(true);
    });
  });

  it("closeModal resets open, mode and create flags", () => {
    const open = reducer(initial, createNewEntity({ type: "Room", headerText: "h" }));
    expect(reducer(open, closeModal())).toMatchObject({
      isOpen: false,
      mode: "view",
      isCreate: false,
    });
  });

  it("switches modes", () => {
    let state = reducer(initial, switchToEdit());
    expect(state.mode).toBe("edit");
    state = reducer(state, switchToDelete());
    expect(state.mode).toBe("delete");
    state = reducer(state, backToView());
    expect(state.mode).toBe("view");
  });

  it("triggers and acknowledges form reset", () => {
    const state = reducer(initial, triggerFormReset());
    expect(state.isResetRequired).toBe(true);
    expect(reducer(state, acknowledgeReset()).isResetRequired).toBe(false);
  });

  it("clearUserContext empties warehouse and product type", () => {
    const state = reducer(initial, { type: "modal/clearUserContext" });
    expect(state.warehouseNumber).toBe("");
    expect(state.selectedOrderProductType).toBe("");
  });
});
