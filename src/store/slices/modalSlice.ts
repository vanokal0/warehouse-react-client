import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ModalEntityType } from "../../typing";

interface ModalState {
  isOpen: boolean;
  mode: "view" | "edit" | "delete";
  entity: ModalEntityType | null;
  formData: FormEntityData | null;
  isResetRequired: boolean;
  isCreate: boolean;
  warehouseNumber: string;
  selectedOrderProductType: string;
  modalHeader: string;
}

const initialState: ModalState = {
  isOpen: false,
  mode: "view",
  entity: null,
  formData: null,
  isResetRequired: false,
  isCreate: false,
  warehouseNumber: "MA759",
  selectedOrderProductType: "Beverages",
  modalHeader: "Нова сутність",
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (
      state,
      action: PayloadAction<{
        entity: ModalEntityType;
        type: string;
      }>
    ) => {
      state.isOpen = true;

      const formData = modalEntityMap.get(action.payload.type);
      if (formData) {
        state.formData = {
          ...formData,
          attributes: formData.attributes.map((attr) => {
            const updatedAttr = { ...attr };

            if (updatedAttr.fetchOptionsUrl) {
              updatedAttr.fetchOptionsUrl = updatedAttr.fetchOptionsUrl
                .replace("__WAREHOUSE__", state.warehouseNumber)
                .replace("__TYPE__", state.selectedOrderProductType);
            }

            const value = new Map(Object.entries(action.payload.entity)).get(
              attr.name
            );
            return { ...updatedAttr, value };
          }),
        };
      } else {
        state.formData = null;
        console.log("NOT FOUND");
      }

      state.entity = action.payload.entity;
      state.mode = "view";
    },

    createNewEntity: (
      state,
      action: PayloadAction<{
        type: string;
        initialAttributes?: Map<string, string>;
        headerText: string;
      }>
    ) => {
      state.modalHeader = action.payload.headerText;
      const formData = modalEntityMap.get(action.payload.type);
      if (formData) {
        state.formData = {
          ...formData,
          attributes: formData.attributes.map((attr) => {
            const updatedAttr = { ...attr };

            if (updatedAttr.fetchOptionsUrl) {
              updatedAttr.fetchOptionsUrl = updatedAttr.fetchOptionsUrl
                .replace("__WAREHOUSE__", state.warehouseNumber)
                .replace("__TYPE__", state.selectedOrderProductType);
            }

            return {
              ...updatedAttr,
              value: action.payload.initialAttributes?.get(attr.name) ?? "",
            };
          }),
        };
      } else {
        state.formData = null;
      }

      state.isOpen = true;
      state.mode = "edit";
      state.entity = null;
      state.isCreate = true;
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.mode = "view";
      state.isCreate = false;
    },
    switchToEdit: (state) => {
      state.mode = "edit";
    },
    switchToDelete: (state) => {
      state.mode = "delete";
    },
    backToView: (state) => {
      state.mode = "view";
    },
    triggerFormReset: (state) => {
      state.isResetRequired = true;
    },
    acknowledgeReset: (state) => {
      state.isResetRequired = false;
    },
    setWarehouseNumber(state, action: PayloadAction<string>) {
      state.warehouseNumber = action.payload;
    },
    setSelectedOrderProductType(state, action: PayloadAction<string>) {
      state.selectedOrderProductType = action.payload;
    },
    clearUserContext(state) {
      state.warehouseNumber = "";
      state.selectedOrderProductType = "";
    },
  },
});

export const modalEntityMap: Map<string, FormEntityData> = new Map([
  [
    "Warehouse",
    {
      titleAttributte: "number",
      fetchAttribute: "id",
      attributes: [
        { name: "id", readonly: true },
        { name: "number", displayName: "Номер" },
        { name: "address", displayName: "Адреса" },
      ],
      createUrl: `${import.meta.env.VITE_BACKEND_API_URL}/warehouses`,
      updateUrl: `${import.meta.env.VITE_BACKEND_API_URL}/warehouses`,
      deleteUrl: `${import.meta.env.VITE_BACKEND_API_URL}/warehouses`,
    },
  ],
  [
    "Employee",
    {
      titleAttributte: "fullName",
      fetchAttribute: "id",
      attributes: [
        { name: "id", readonly: true },
        { name: "firstName", displayName: "Прізвище", type: "text" },
        { name: "lastName", displayName: "Ім'я", type: "text" },
        {
          name: "warehouseNumber",
          displayName: "Склад",
          type: "text",
          readonly: true,
        },
        {
          name: "position",
          displayName: "Посада",
          type: "text",
          fetchOptionsUrl: `${
            import.meta.env.VITE_BACKEND_API_URL
          }/employee-positions/position-names`,
        },
        { name: "fullName", readonly: true },
      ],
      createUrl: `${import.meta.env.VITE_BACKEND_API_URL}/employees`,
      updateUrl: `${import.meta.env.VITE_BACKEND_API_URL}/employees`,
      deleteUrl: `${import.meta.env.VITE_BACKEND_API_URL}/employees`,
    },
  ],
  [
    "Room",
    {
      titleAttributte: "number",
      fetchAttribute: "number",
      attributes: [
        {
          name: "number",
          displayName: "Номер",
          type: "text",
          readonly: true,
        },
        {
          name: "warehouseNumber",
          displayName: "Склад",
          type: "text",
          readonly: true,
        },
        {
          name: "type",
          displayName: "Тип",
          type: "text",
          fetchOptionsUrl: `${
            import.meta.env.VITE_BACKEND_API_URL
          }/product-types/type-names`,
        },
        {
          name: "availableSpace",
          displayName: "Доступне місце",
          type: "number",
        },
        {
          name: "temperature",
          displayName: "Температура",
          type: "text",
          fetchOptionsUrl: `${
            import.meta.env.VITE_BACKEND_API_URL
          }/room-temperatures/values`,
        },
        {
          name: "humidity",
          displayName: "Вологість (%)",
          type: "number",
          fetchOptionsUrl: `${
            import.meta.env.VITE_BACKEND_API_URL
          }/room-humidities/values`,
        },
      ],
      createUrl: `${import.meta.env.VITE_BACKEND_API_URL}/rooms`,
      updateUrl: `${import.meta.env.VITE_BACKEND_API_URL}/rooms`,
      deleteUrl: `${import.meta.env.VITE_BACKEND_API_URL}/rooms`,
    },
  ],
  [
    "Parking Lot",
    {
      titleAttributte: "number",
      fetchAttribute: "number",
      attributes: [
        { name: "number", displayName: "Номер", readonly: true },
        {
          name: "warehouseNumber",
          displayName: "Склад",
          type: "text",
          readonly: true,
        },
        { name: "dockNumber", displayName: "Док", type: "text" },
        {
          name: "type",
          displayName: "Транспорт",
          type: "text",
          fetchOptionsUrl: `${
            import.meta.env.VITE_BACKEND_API_URL
          }/vehicle-types/type-names`,
        },
      ],
      createUrl: `${import.meta.env.VITE_BACKEND_API_URL}/parking-lots`,
      updateUrl: `${import.meta.env.VITE_BACKEND_API_URL}/parking-lots`,
      deleteUrl: `${import.meta.env.VITE_BACKEND_API_URL}/parking-lots`,
    },
  ],

  [
    "Product Placement",
    {
      titleAttributte: "number",
      fetchAttribute: "number",
      attributes: [
        { name: "number", displayName: "Номер", readonly: true },
        { name: "orderNumber", displayName: "Замовлення", readonly: true },
        { name: "product", displayName: "Продукт", readonly: true },
        { name: "quantity", displayName: "Кількість", type: "number" },
        {
          name: "placementDateTime",
          displayName: "Час",
          readonly: true,
          type: "datetime-local",
        },
        {
          name: "roomNumber",
          displayName: "Кімната",
          type: "text",
          fetchOptionsUrl: `${
            import.meta.env.VITE_BACKEND_API_URL
          }/warehouses/rooms?warehouseNumber=__WAREHOUSE__&productType=__TYPE__`,
        },
        {
          name: "lotBookingNumber",
          displayName: "Бронювання",
          type: "text",
          fetchOptionsUrl: `${
            import.meta.env.VITE_BACKEND_API_URL
          }/lot-bookings/warehouse?warehouseNumber=__WAREHOUSE__`,
        },
        { name: "lotNumber", displayName: "Лот", readonly: true },
        {
          name: "employee",
          displayName: "Оператор",
          type: "text",
          fetchOptionsUrl: `${
            import.meta.env.VITE_BACKEND_API_URL
          }/warehouses/operators?warehouseNumber=__WAREHOUSE__`,
        },
      ],
      createUrl: `${import.meta.env.VITE_BACKEND_API_URL}/product-placements`,
      updateUrl: `${import.meta.env.VITE_BACKEND_API_URL}/product-placements`,
      deleteUrl: `${import.meta.env.VITE_BACKEND_API_URL}/product-placements`,
    },
  ],
  [
    "Product Shipment",
    {
      titleAttributte: "number",
      fetchAttribute: "number",
      attributes: [
        { name: "number", displayName: "Номер", readonly: true },
        { name: "orderNumber", displayName: "Замовлення", readonly: true },
        { name: "product", displayName: "Продукт", readonly: true },
        { name: "quantity", displayName: "Кількість", type: "number" },
        {
          name: "shipmentDateTime",
          displayName: "Час",
          readonly: true,
          type: "datetime-local",
        },
        {
          name: "roomNumber",
          displayName: "Кімната",
          type: "text",
          fetchOptionsUrl: `${
            import.meta.env.VITE_BACKEND_API_URL
          }/warehouses/rooms?warehouseNumber=__WAREHOUSE__&productType=__TYPE__`,
        },
        {
          name: "lotBookingNumber",
          displayName: "Бронювання",
          type: "text",
          fetchOptionsUrl: `${
            import.meta.env.VITE_BACKEND_API_URL
          }/lot-bookings/warehouse?warehouseNumber=__WAREHOUSE__`,
        },
        { name: "lotNumber", displayName: "Лот", readonly: true },
        {
          name: "employee",
          displayName: "Оператор",
          type: "text",
          fetchOptionsUrl: `${
            import.meta.env.VITE_BACKEND_API_URL
          }/warehouses/operators?warehouseNumber=__WAREHOUSE__`,
        },
      ],
      createUrl: `${import.meta.env.VITE_BACKEND_API_URL}/product-shipments`,
      updateUrl: `${import.meta.env.VITE_BACKEND_API_URL}/product-shipments`,
      deleteUrl: `${import.meta.env.VITE_BACKEND_API_URL}/product-shipments`,
    },
  ],
  [
    "Lot Booking",
    {
      titleAttributte: "number",
      fetchAttribute: "number",
      attributes: [
        { name: "number", displayName: "Номер", type: "text", readonly: true },
        { name: "lotNumber", displayName: "Лот", type: "text", readonly: true },
        {
          name: "supplierName",
          displayName: "Постачальник",
          type: "text",
          fetchOptionsUrl: `${
            import.meta.env.VITE_BACKEND_API_URL
          }/suppliers/names`,
        },
        {
          name: "bookingDateTime",
          displayName: "Час створення",
          type: "datetime-local",
        },
        {
          name: "startDateTime",
          displayName: "Початок броні",
          type: "datetime-local",
        },
        {
          name: "endDateTime",
          displayName: "Кінець броні",
          type: "datetime-local",
        },
      ],
      createUrl: `${import.meta.env.VITE_BACKEND_API_URL}/lot-bookings`,
      updateUrl: `${import.meta.env.VITE_BACKEND_API_URL}/lot-bookings`,
      deleteUrl: `${import.meta.env.VITE_BACKEND_API_URL}/lot-bookings`,
    },
  ],
]);

export const {
  openModal,
  closeModal,
  switchToEdit,
  switchToDelete,
  backToView,
  triggerFormReset,
  createNewEntity,
  acknowledgeReset,
  setWarehouseNumber,
  setSelectedOrderProductType,
} = modalSlice.actions;

export default modalSlice.reducer;

type AttributeType = "text" | "number" | "date" | "datetime-local";

type formAttributeData = {
  name: string;
  displayName?: string;
  value?: string | number;
  type?: AttributeType;
  fetchOptionsUrl?: string;
  readonly?: boolean;
};

export type FormEntityData = {
  titleAttributte: string;
  fetchAttribute: string;
  attributes: formAttributeData[];
  createUrl: string;
  updateUrl: string;
  deleteUrl: string;
};
