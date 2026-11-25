import { ProductPlacementData, ProductShipmentData } from "../typing";
import { requestJson } from "./http";

export type ProductOperations = {
  placements: ProductPlacementData[];
  shipments: ProductShipmentData[];
};

export async function fetchProductOperations(
  orderNumber: string,
  productName: string
): Promise<ProductOperations> {
  const query = `orderNumber=${encodeURIComponent(
    orderNumber
  )}&productName=${encodeURIComponent(productName)}`;

  const [placements, shipments] = await Promise.all([
    requestJson<ProductPlacementData[]>(
      `/product-placements/by-order-and-product?${query}`
    ),
    requestJson<ProductShipmentData[]>(
      `/product-shipments/by-order-and-product?${query}`
    ),
  ]);

  return { placements, shipments };
}
