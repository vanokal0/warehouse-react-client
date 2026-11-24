//DTO
export interface EmployeeData {
  id: number;
  firstName: string;
  lastName: string;
  warehouseNumber: string;
  fullName: string;
  position: string;
}

export type ParkingLotData = {
  number: string;
  warehouseNumber: string;
  dockNumber: string;
  type: string;
};

export type LoadingDockData = {
  number: string;
  parkingLots: ParkingLotData[];
};

export type RoomData = {
  number: string;
  warehouseNumber: string;
  availableSpace: number;
  humidity: number;
  temperature: string;
  type: string;
};

export type WarehouseData = {
  id: number;
  number: string;
  address: string;
  employees: EmployeeData[];
  rooms: RoomData[];
  loadingDocks: LoadingDockData[];
  location: Location;
};

export type Location = {
  lat: number;
  lng: number;
};

export type SupplierData = {
  companyName: string;
  emailAddress: string;
};

export type ProductData = {
  id: number;
  concreteProductName: string;
  productName: string;
  type: string;
  value: number;
  weight: number;
  manufacturer: string;
};

export type OrderProductData = {
  orderNumber: string;
  concreteProduct: ProductData;
  quantity: number;
};

export type OrderData = {
  number: string;
  products: OrderProductData[];
  cost: number;
  orderDateTime: string;
  estimatedArrivalDate: string;
  estimatedShipmentDate: string;
  paymentType: string;
  orderStatus: string;
  supplier: string;
};

export type ProductPlacementData = {
  number: string;
  orderNumber: string;
  product: string;
  quantity: number;
  placementDateTime: string;
  roomNumber: string;
  lotNumber: string;
  lotBookingNumber: string;
  employee: string;
};

export type ProductShipmentData = {
  number: string;
  orderNumber: string;
  product: string;
  quantity: number;
  shipmentDateTime: string;
  roomNumber: string;
  lotNumber: string;
  lotBookingNumber: string;
  employee: string;
};

export type LotBookingData = {
  number: string;
  lotNumber: string;
  supplierName: string;
  bookingDateTime: string;
  startDateTime: string;
  endDateTime: string;
};

export type ModalEntityType =
  | WarehouseData
  | EmployeeData
  | RoomData
  | ParkingLotData
  | ProductShipmentData
  | ProductPlacementData
  | LotBookingData;

export type ConcreteProductDTO = {
  id: number;
  concreteProductName: string;
  productName: string;
  type: string;
  value: number;
  weight: number;
  manufacturer: string;
};

export type OrderProductDTO = {
  concreteProduct: ConcreteProductDTO;
  quantity: number;
  orderNumber: string;
};

export type OrderDTO = {
  number: string;
  products: OrderProductDTO[];
  cost: number;
  orderDateTime: string; // ISO string
  estimatedArrivalDate: string; // yyyy-MM-dd
  estimatedShipmentDate: string; // yyyy-MM-dd
  paymentType: string;
  orderStatus: string;
  supplier: string;
};

export type ActionLogData = {
  id: string;
  initiatorFullName: number;
  timestamp: string;
  cancelled: boolean;

  operationType: string;

  entityName: string;
  entityType: string;

  prevAttributes: Map<string, string>;
  newAttributes: Map<string, string>;
};
