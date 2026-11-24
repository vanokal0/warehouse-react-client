import {
  EmployeeData,
  LotBookingData,
  OrderData,
  ParkingLotData,
  ProductData,
  ProductPlacementData,
  ProductShipmentData,
  RoomData,
  WarehouseData,
} from "../typing";

export const makeProduct = (overrides: Partial<ProductData> = {}): ProductData => ({
  id: 1,
  concreteProductName: "Cola 0.5L",
  productName: "Cola",
  type: "Beverages",
  value: 2,
  weight: 0.5,
  manufacturer: "ACME",
  ...overrides,
});

export const makeOrder = (overrides: Partial<OrderData> = {}): OrderData => ({
  number: "ORD-1",
  products: [],
  cost: 100,
  orderDateTime: "2025-01-15T10:30:00Z",
  estimatedArrivalDate: "2025-01-20",
  estimatedShipmentDate: "2025-01-25",
  paymentType: "Card",
  orderStatus: "New",
  supplier: "Supplier Inc",
  ...overrides,
});

export const makeRoom = (overrides: Partial<RoomData> = {}): RoomData => ({
  number: "R1",
  warehouseNumber: "W1",
  availableSpace: 100,
  humidity: 40,
  temperature: "20",
  type: "Beverages",
  ...overrides,
});

export const makeEmployee = (overrides: Partial<EmployeeData> = {}): EmployeeData => ({
  id: 1,
  firstName: "John",
  lastName: "Doe",
  warehouseNumber: "W1",
  fullName: "John Doe",
  position: "Operator",
  ...overrides,
});

export const makeParkingLot = (
  overrides: Partial<ParkingLotData> = {}
): ParkingLotData => ({
  number: "P1",
  warehouseNumber: "W1",
  dockNumber: "D1",
  type: "Truck",
  ...overrides,
});

export const makeWarehouse = (overrides: Partial<WarehouseData> = {}): WarehouseData => ({
  id: 1,
  number: "W1",
  address: "Main st. 1",
  employees: [makeEmployee()],
  rooms: [makeRoom()],
  loadingDocks: [{ number: "D1", parkingLots: [makeParkingLot()] }],
  location: { lat: 50, lng: 30 },
  ...overrides,
});

export const makePlacement = (
  overrides: Partial<ProductPlacementData> = {}
): ProductPlacementData => ({
  number: "PL1",
  orderNumber: "ORD-1",
  product: "Cola",
  quantity: 10,
  placementDateTime: "2025-01-20T10:00",
  roomNumber: "R1",
  lotNumber: "L1",
  lotBookingNumber: "LB1",
  employee: "John Doe",
  ...overrides,
});

export const makeShipment = (
  overrides: Partial<ProductShipmentData> = {}
): ProductShipmentData => ({
  number: "SH1",
  orderNumber: "ORD-1",
  product: "Cola",
  quantity: 5,
  shipmentDateTime: "2025-01-25T10:00",
  roomNumber: "R1",
  lotNumber: "L1",
  lotBookingNumber: "LB1",
  employee: "John Doe",
  ...overrides,
});

export const makeBooking = (overrides: Partial<LotBookingData> = {}): LotBookingData => ({
  number: "LB1",
  lotNumber: "L1",
  supplierName: "Supplier Inc",
  bookingDateTime: "2025-01-10T08:00:00Z",
  startDateTime: "2025-01-20T09:15:00Z",
  endDateTime: "2025-01-20T11:45:00Z",
  ...overrides,
});
