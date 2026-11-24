import { OrderData, OrderProductData, ProductData } from "../../../typing";
import styles from "./MultipleOrderPage.module.css";
import { GridColDef } from "@mui/x-data-grid";
import TextButton from "../../buttons/TextButton";
import EntityInteractiveTable from "../../tables/EntityInteractiveTable";
import { useDispatch, useSelector } from "react-redux";
import { showPopover, hidePopover } from "../../../store/slices/popoverSlice";
import ProductPopover from "../../pop-ups/ProductPopover";
import { useEffect, useState } from "react";
import OrderContextSwitcher from "../../sections/OrderContextSwitcher";
import { RootState } from "../../../store/store";

export default function MultipleOrderPage() {
  const dispatch = useDispatch();

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

  const orderColumns: GridColDef<OrderData>[] = [
    { field: "number", headerName: "Номер", flex: 1, type: "string" },
    {
      field: "orderDateTime",
      headerName: "Дата",
      flex: 1,
      valueGetter: (value: string) => new Date(value),
      type: "date",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "supplier",
      headerName: "Постачальник",
      flex: 1.5,
      type: "string",
    },
    { field: "orderStatus", headerName: "Статус", flex: 1, type: "string" },
    {
      field: "products",
      headerName: "Продукти",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const products: OrderProductData[] = params.value;
        return (
          <div
            onMouseEnter={(e) => {
              const rect = (
                e.currentTarget as HTMLElement
              ).getBoundingClientRect();
              dispatch(
                showPopover({
                  products,
                  position: { x: rect.right, y: rect.top },
                })
              );
            }}
            onMouseLeave={() => dispatch(hidePopover())}
            style={{ cursor: "default", textDecoration: "underline dotted" }}
          >
            {products?.length ?? 0} продуктів
          </div>
        );
      },
    },
    { field: "cost", headerName: "Вартість (USD)", flex: 1, type: "number" },
    {
      field: "actions",
      headerName: "Дії",
      sortable: false,
      filterable: false,
      minWidth: 82,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <TextButton
          isSmall
          onClick={() => setSelectedOrder(params.row)}
          textValue="Деталі"
        />
      ),
    },
  ];

  return (
    <div className={styles["page-container"]}>
      <section className={styles["order-section"]}>
        <EntityInteractiveTable<OrderData>
          title="Замовлення"
          pageSize={11}
          key={refreshKey}
          dataUrl={`${import.meta.env.VITE_BACKEND_API_URL}/orders/paged`}
          columns={orderColumns}
          idAccessor={(order) => order.number}
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
