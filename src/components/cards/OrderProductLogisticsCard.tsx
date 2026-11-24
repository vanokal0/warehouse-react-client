import {
  BoxIcon,
  DoorOpenIcon,
  DrumstickIcon,
  EllipsisIcon,
  TruckIcon,
  UserIcon,
} from "lucide-react";
import styles from "./OrderProductLogisticsCard.module.css";
import {
  OrderProductData,
  ProductPlacementData,
  ProductShipmentData,
} from "../../typing";
import { useState } from "react";
import IconedAttribute from "./multiple-attribute/IconedAttribute";
import TextButton from "../buttons/TextButton";
import MultipleAttributeCard from "./multiple-attribute/MultipleAttributeCard";
import {
  createNewEntity,
  openModal,
  setSelectedOrderProductType,
} from "../../store/slices/modalSlice";
import { useDispatch } from "react-redux";

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
  const [showPlacements, setShowPlacements] = useState(false);
  const [showShipments, setShowShipments] = useState(false);

  const dispatch = useDispatch();

  const totalPlaced = placements.reduce((sum, p) => sum + p.quantity, 0);
  const totalShipped = shipments.reduce((sum, s) => sum + s.quantity, 0);
  const orderedQuantity = orderProduct.quantity;

  const handleTogglePlacements = () => {
    if (!showPlacements) {
      handleToggle(orderProduct.concreteProduct.concreteProductName);
    }
    setShowPlacements((prev) => {
      setShowShipments(false);
      return !prev;
    });
  };

  const handleToggleShipments = () => {
    if (!showShipments) {
      handleToggle(orderProduct.concreteProduct.concreteProductName);
    }
    setShowShipments((prev) => {
      setShowPlacements(false);
      return !prev;
    });
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
          onClick={handleTogglePlacements}
          isSecondary={showPlacements}
        />
        <TextButton
          textValue="Відвантаження"
          onClick={handleToggleShipments}
          isSecondary={showShipments}
        />
      </div>

      {showPlacements && (
        <div className={styles["subsection"]}>
          <div className={styles["subsection-header"]}>
            <h4>Отримання</h4>
            {totalPlaced < orderedQuantity && (
              <TextButton
                onClick={() => {
                  dispatch(
                    setSelectedOrderProductType(
                      orderProduct.concreteProduct.type
                    )
                  );
                  dispatch(
                    createNewEntity({
                      type: "Product Placement",
                      initialAttributes: new Map([
                        [
                          "product",
                          orderProduct.concreteProduct.concreteProductName,
                        ],
                        ["orderNumber", orderProduct.orderNumber],
                        [
                          "placementDateTime",
                          new Date().toISOString().slice(0, 16),
                        ],
                      ]),
                      headerText: "Нове розміщення",
                    })
                  );
                }}
                textValue="+ Додати"
              />
            )}
          </div>
          <div className={styles["list-container"]}>
            <ul>
              {placements.map((p) => (
                <MultipleAttributeCard
                  title={p.number}
                  mainAttribute={{ Icon: BoxIcon, value: `${p.quantity} шт.` }}
                  sideAttributes={[
                    { Icon: UserIcon, value: p.employee },
                    { Icon: DoorOpenIcon, value: p.roomNumber },
                    { Icon: TruckIcon, value: p.lotNumber },
                  ]}
                  controls={[
                    {
                      Icon: EllipsisIcon,
                      onClick: () => {
                        dispatch(
                          setSelectedOrderProductType(
                            orderProduct.concreteProduct.type
                          )
                        );
                        dispatch(
                          openModal({
                            entity: p,
                            type: "Product Placement",
                          })
                        );
                      },
                    },
                  ]}
                />
              ))}
            </ul>
          </div>
        </div>
      )}

      {showShipments && (
        <div className={styles["subsection"]}>
          <div className={styles["subsection-header"]}>
            <h4>Відвантаження</h4>
            {totalShipped < orderedQuantity && (
              <TextButton
                onClick={() =>
                  dispatch(
                    createNewEntity({
                      type: "Product Shipment",
                      initialAttributes: new Map([
                        [
                          "product",
                          orderProduct.concreteProduct.concreteProductName,
                        ],
                        ["orderNumber", orderProduct.orderNumber],
                        [
                          "shipmentDateTime",
                          new Date().toISOString().slice(0, 16),
                        ],
                      ]),
                      headerText: "Нове відправлення",
                    })
                  )
                }
                textValue="+ Додати"
              />
            )}
          </div>
          <div className={styles["list-container"]}>
            <ul>
              {shipments.map((s) => (
                <MultipleAttributeCard
                  title={s.number}
                  mainAttribute={{ Icon: BoxIcon, value: `${s.quantity} шт.` }}
                  sideAttributes={[
                    { Icon: UserIcon, value: s.employee },
                    { Icon: DoorOpenIcon, value: s.roomNumber },
                    { Icon: TruckIcon, value: s.lotNumber },
                  ]}
                  controls={[
                    {
                      Icon: EllipsisIcon,
                      onClick: () =>
                        dispatch(
                          openModal({ entity: s, type: "Product Shipment" })
                        ),
                    },
                  ]}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
