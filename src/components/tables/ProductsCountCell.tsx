import { useDispatch } from "react-redux";
import { OrderProductData } from "../../typing";
import { hidePopover, showPopover } from "../../store/slices/popoverSlice";

type Props = {
  products: OrderProductData[];
};

export default function ProductsCountCell({ products }: Props) {
  const dispatch = useDispatch();

  return (
    <div
      onMouseEnter={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
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
}
