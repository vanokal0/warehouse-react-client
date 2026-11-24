import { useEffect } from "react";

import ProductDetailsForm from "../pop-ups/forms/ProductDetailsForm";
import OrderDetailsForm from "../pop-ups/forms/OrderDetailsForm";
import { OrderData, ProductData } from "../../typing";
import IconedPlaceholder from "./IconedPlaceholder";
import { ClipboardListIcon } from "lucide-react";
import { setOrder } from "../../store/slices/orderViewSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";

type Props = {
  order: OrderData | null;
  allProducts: ProductData[];
  onCloseOrderForm: () => void;
};

export default function OrderContextSwitcher({
  order,
  allProducts,
  onCloseOrderForm,
}: Props) {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.orderView.mode);
  const selectedProduct = useSelector(
    (state: RootState) => state.orderView.selectedProduct
  );
  const currentOrder = useSelector(
    (state: RootState) => state.orderView.currentOrder
  );

  useEffect(() => {
    dispatch(setOrder(order));
  }, [order, dispatch]);

  if (!currentOrder) {
    return (
      <IconedPlaceholder
        Icon={ClipboardListIcon}
        textValue="Для перегляду деталей оберіть замовлення"
      />
    );
  }

  if (mode === "createProduct") {
    return <ProductDetailsForm product={null} />;
  }

  if (mode === "viewProduct" && selectedProduct) {
    return <ProductDetailsForm product={selectedProduct} />;
  }

  return (
    <OrderDetailsForm
      order={currentOrder}
      allProducts={allProducts}
      onClose={onCloseOrderForm}
    />
  );
}
