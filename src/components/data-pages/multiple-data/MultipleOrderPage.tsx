import { OrderData, ProductData } from "../../../typing";
import styles from "./MultipleOrderPage.module.css";
import TextButton from "../../buttons/TextButton";
import EntityInteractiveTable from "../../tables/EntityInteractiveTable";
import { getOrderColumns, getOrderId } from "../../tables/orderColumns";
import { useSelector } from "react-redux";
import ProductPopover from "../../pop-ups/ProductPopover";
import { useEffect, useState } from "react";
import OrderContextSwitcher from "../../sections/OrderContextSwitcher";
import { RootState } from "../../../store/store";

export default function MultipleOrderPage() {
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const refreshKey = useSelector(
    (state: RootState) => state.orderView.refreshTableCounter
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/concrete-products`
        );
        const data = await res.json();
        setAllProducts(data);
      } catch (error) {
        console.error("Не вдалося завантажити продукти:", error);
      }
    };
    fetchProducts();
  }, []);

  const orderColumns = getOrderColumns({
    onDetails: setSelectedOrder,
    extraColumns: [
      { field: "cost", headerName: "Вартість (USD)", flex: 1, type: "number" },
    ],
  });

  return (
    <div className={styles["page-container"]}>
      <section className={styles["order-section"]}>
        <EntityInteractiveTable<OrderData>
          title="Замовлення"
          pageSize={11}
          refreshToken={refreshKey}
          dataUrl={`${import.meta.env.VITE_BACKEND_API_URL}/orders/paged`}
          columns={orderColumns}
          idAccessor={getOrderId}
          renderHeaderButtons={() => (
            <TextButton
              textValue="+ Додати"
              onClick={() =>
                setSelectedOrder({
                  number: "NEW-000",
                  cost: 0,
                  orderStatus: "CREATED",
                  supplier: "",
                  orderDateTime: new Date().toISOString(),
                  estimatedArrivalDate: "",
                  estimatedShipmentDate: "",
                  products: [],
                  paymentType: "",
                })
              }
            />
          )}
        />
      </section>

      <section className={styles["order-details-section"]}>
        <OrderContextSwitcher
          order={selectedOrder}
          allProducts={allProducts}
          onCloseOrderForm={() => setSelectedOrder(null)}
        />
      </section>

      <ProductPopover />
    </div>
  );
}
