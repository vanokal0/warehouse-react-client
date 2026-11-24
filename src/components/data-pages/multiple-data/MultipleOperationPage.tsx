// components/pages/LogisticsPage.tsx
import { useDispatch, useSelector } from "react-redux";
import { setSelectedOrder } from "../../../store/slices/orderLogisticsSlice";
import { OrderData } from "../../../typing";
import EntityInteractiveTable from "../../tables/EntityInteractiveTable";
import { getOrderColumns } from "../../tables/orderColumns";
import styles from "./MultipleOperationPage.module.css";

import ProductPopover from "../../pop-ups/ProductPopover";
import LogisticsDetailsSection from "../../sections/LogisticsDetailsSection";
import { RootState } from "../../../store/store";

export default function MultipleOperationPage() {
  const dispatch = useDispatch();
  const refreshKey = useSelector(
    (state: RootState) => state.orderLogistics.refreshKey
  );

  const orderColumns = getOrderColumns({
    onDetails: (order) => dispatch(setSelectedOrder(order)),
    supplierFlex: 1.4,
  });

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
