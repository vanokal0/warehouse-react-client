// components/pages/LogisticsPage.tsx
import { useDispatch, useSelector } from "react-redux";
import { setSelectedOrder } from "../../../store/slices/orderLogisticsSlice";
import { OrderData, OrderProductData } from "../../../typing";
import EntityInteractiveTable from "../../tables/EntityInteractiveTable";
import styles from "./MultipleOperationPage.module.css";

import ProductPopover from "../../pop-ups/ProductPopover";
import TextButton from "../../buttons/TextButton";
import { GridColDef } from "@mui/x-data-grid";
import { showPopover, hidePopover } from "../../../store/slices/popoverSlice";
import LogisticsDetailsSection from "../../sections/LogisticsDetailsSection";
import { RootState } from "../../../store/store";

export default function MultipleOperationPage() {
  const dispatch = useDispatch();
  const refreshKey = useSelector(
    (state: RootState) => state.orderLogistics.refreshKey
  );

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
      flex: 1.4,
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
            style={{ textDecoration: "underline dotted", cursor: "default" }}
          >
            {products?.length ?? 0} продуктів
          </div>
        );
      },
    },
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
          textValue="Деталі"
          onClick={() => dispatch(setSelectedOrder(params.row))}
        />
      ),
    },
  ];

  return (
    <div className={styles["page-container"]}>
      <section className={styles["order-section"]}>
        <EntityInteractiveTable<OrderData>
          key={refreshKey}
          title="Замовлення"
          dataUrl={`${import.meta.env.VITE_BACKEND_API_URL}/orders/paged`}
          columns={orderColumns}
          idAccessor={(order) => order.number}
          pageSize={11}
        />
      </section>

      <section className={styles["details-section"]}>
        <LogisticsDetailsSection />
      </section>

      <ProductPopover />
    </div>
  );
}
