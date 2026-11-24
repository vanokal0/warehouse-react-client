import { BoxIcon, DrumstickIcon } from "lucide-react";
import styles from "./OrderProductLogisticsCard.module.css";
import {
  OrderProductData,
  ProductPlacementData,
  ProductShipmentData,
} from "../../typing";
import { useState } from "react";
import IconedAttribute from "./multiple-attribute/IconedAttribute";
import TextButton from "../buttons/TextButton";
import OperationSubsection from "./OperationSubsection";
import {
  createNewEntity,
  openModal,
  setSelectedOrderProductType,
} from "../../store/slices/modalSlice";
import { useDispatch } from "react-redux";

type ActiveSection = "placements" | "shipments" | null;

export type Props = {
  orderProduct: OrderProductData;
  placements: ProductPlacementData[];
  shipments: ProductShipmentData[];
  handleToggle: (cpName: string) => void;
};

export default function OrderProductLogisticsCard({
  orderProduct,
  placements,
  shipments,
  handleToggle,
}: Props) {
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);

  const dispatch = useDispatch();

  const totalPlaced = placements.reduce((sum, p) => sum + p.quantity, 0);
  const totalShipped = shipments.reduce((sum, s) => sum + s.quantity, 0);
  const orderedQuantity = orderProduct.quantity;

  const toggleSection = (section: Exclude<ActiveSection, null>) => {
    if (activeSection !== section) {
      handleToggle(orderProduct.concreteProduct.concreteProductName);
    }
    setActiveSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className={styles["product-card"]}>
      <div className={styles["colored-figure"]} />
      <div className={styles["product-header"]}>
        <h3>{`${orderProduct.concreteProduct.concreteProductName}`}</h3>
      </div>
      <div className={styles["attribute-row"]}>
        <IconedAttribute Icon={BoxIcon} value={`${orderedQuantity} шт.`} />
        <IconedAttribute
          Icon={DrumstickIcon}
          value={`${orderProduct.concreteProduct.type}`}
        />
      </div>

      <div className={styles["button-row"]}>
        <TextButton
          textValue="Отримання"
          onClick={() => toggleSection("placements")}
          isSecondary={activeSection === "placements"}
        />
        <TextButton
          textValue="Відвантаження"
          onClick={() => toggleSection("shipments")}
          isSecondary={activeSection === "shipments"}
        />
      </div>

      {activeSection === "placements" && (
        <OperationSubsection
          title="Отримання"
          operations={placements}
          canAdd={totalPlaced < orderedQuantity}
          onAdd={() => {
            dispatch(
              setSelectedOrderProductType(orderProduct.concreteProduct.type)
            );
            dispatch(
              createNewEntity({
                type: "Product Placement",
                initialAttributes: new Map([
                  ["product", orderProduct.concreteProduct.concreteProductName],
                  ["orderNumber", orderProduct.orderNumber],
                  ["placementDateTime", new Date().toISOString().slice(0, 16)],
                ]),
                headerText: "Нове розміщення",
              })
            );
          }}
          onOpen={(placement) => {
            dispatch(
              setSelectedOrderProductType(orderProduct.concreteProduct.type)
            );
            dispatch(openModal({ entity: placement, type: "Product Placement" }));
          }}
        />
      )}

      {activeSection === "shipments" && (
        <OperationSubsection
          title="Відвантаження"
          operations={shipments}
          canAdd={totalShipped < orderedQuantity}
          onAdd={() =>
            dispatch(
              createNewEntity({
                type: "Product Shipment",
                initialAttributes: new Map([
                  ["product", orderProduct.concreteProduct.concreteProductName],
                  ["orderNumber", orderProduct.orderNumber],
                  ["shipmentDateTime", new Date().toISOString().slice(0, 16)],
                ]),
                headerText: "Нове відправлення",
              })
            )
          }
          onOpen={(shipment) =>
            dispatch(openModal({ entity: shipment, type: "Product Shipment" }))
          }
        />
      )}
    </div>
  );
}
