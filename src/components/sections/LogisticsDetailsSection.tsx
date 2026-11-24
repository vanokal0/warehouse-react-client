import { useDispatch, useSelector } from "react-redux";

import styles from "./LogisticsDetailsSection.module.css";
import { RootState } from "../../store/store";
import {
  setPlacements,
  setShipments,
  toggleProductExpanded,
} from "../../store/slices/orderLogisticsSlice";
import { OrderProductData } from "../../typing";
import OrderProductLogisticsCard from "../cards/OrderProductLogisticsCard";
import PaginatedSearchableList from "../lists/PaginatedSearchableList";
import IconedPlaceholder from "./IconedPlaceholder";
import { ClipboardListIcon } from "lucide-react";

export default function LogisticsDetailsSection() {
  const dispatch = useDispatch();
  const { selectedOrder, placements, shipments } = useSelector(
    (state: RootState) => state.orderLogistics
  );

  const handleToggle = async (productName: string) => {
    dispatch(toggleProductExpanded(productName));

    if (!placements[productName] && !shipments[productName]) {
      const urlBase = import.meta.env.VITE_BACKEND_API_URL;
      const encodedOrder = encodeURIComponent(selectedOrder!.number);
      const encodedProduct = encodeURIComponent(productName);

      const [placementsRes, shipmentsRes] = await Promise.all([
        fetch(
          `${urlBase}/product-placements/by-order-and-product?orderNumber=${encodedOrder}&productName=${encodedProduct}`
        ),
        fetch(
          `${urlBase}/product-shipments/by-order-and-product?orderNumber=${encodedOrder}&productName=${encodedProduct}`
        ),
      ]);

      const [placementsData, shipmentsData] = await Promise.all([
        placementsRes.json(),
        shipmentsRes.json(),
      ]);

      dispatch(setPlacements({ productId: productName, data: placementsData }));
      dispatch(setShipments({ productId: productName, data: shipmentsData }));
    }
  };

  if (!selectedOrder)
    return (
      <IconedPlaceholder
        Icon={ClipboardListIcon}
        textValue="Для перегляду операцій оберіть замовлення"
      />
    );

  return (
    <div className={styles.container}>
      <PaginatedSearchableList
        data={selectedOrder.products}
        renderItem={(orderProduct: OrderProductData) => {
          const plcs =
            placements[orderProduct.concreteProduct.concreteProductName] || [];
          const shps =
            shipments[orderProduct.concreteProduct.concreteProductName] || [];
          return (
            <OrderProductLogisticsCard
              orderProduct={orderProduct}
              placements={plcs}
              shipments={shps}
              handleToggle={handleToggle}
            />
          );
        }}
        getKey={(orderProduct: OrderProductData) =>
          orderProduct.concreteProduct.concreteProductName
        }
        title={`Операції з продуктами ${selectedOrder.number}`}
        layout="list"
      />
    </div>
  );
}
