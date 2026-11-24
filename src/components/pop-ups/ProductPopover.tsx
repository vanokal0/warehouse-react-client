import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import { RootState } from "../../store/store";
import { OrderProductData } from "../../typing";
import styles from "./ProductPopover.module.css";

export default function ProductPopover() {
  const { products, position } = useSelector(
    (state: RootState) => state.popover
  );

  if (!products || !position) return null;

  return createPortal(
    <div
      className={styles["popover-container"]}
      style={{ top: position.y + 10, left: position.x + 10 }}
    >
      <strong>Продукти в замовлені:</strong>
      <ul>
        {products.map((p: OrderProductData, i) => (
          <li key={i}>
            {p.concreteProduct.concreteProductName} — {p.concreteProduct.value}
            $, {p.quantity} шт.
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );
}
