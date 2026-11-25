import { useEffect, useState } from "react";
import { Formik, Form, Field, FieldArray, useFormikContext } from "formik";
import * as yup from "yup";
import {
  OrderData,
  OrderDTO,
  ProductData,
  ProductPlacementData,
  ProductShipmentData,
} from "../../../typing";
import styles from "./OrderDetailsForm.module.css";
import TextButton from "../../buttons/TextButton";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MinusIcon,
  PenLineIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import ControlButtons from "../../buttons/ControlButtons";
import RoundIconButton from "../../buttons/RoundIconButton";
import { Autocomplete, TextField } from "@mui/material";
import AsyncAutocompleteInput from "../forms/input/AsyncAutocompleteInput";
import { useDispatch, useSelector } from "react-redux";
import {
  createProduct,
  setDeleteMode,
  setEditingOrder,
  triggerTableRefresh,
  viewProduct,
} from "../../../store/slices/orderViewSlice";
import { RootState } from "../../../store/store";
import {
  fetchProductOperations,
  ProductOperations,
} from "../../../api/productOperations";

const validationSchema = yup.object().shape({
  cost: yup.number().required(),
  orderStatus: yup.string().required(),
  supplier: yup.string().required("Обов’язково"),
  products: yup
    .array()
    .of(
      yup.object().shape({
        quantity: yup.number().min(1).required(),
      })
    )
    .min(1, "Замовлення має містити хоча б один продукт"),
});

type Props = {
  order: OrderData;
  allProducts: ProductData[];
  onClose: () => void;
};

type FieldAttributes = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "datetime-local";
  readonly?: boolean;
};

const orderFields: FieldAttributes[] = [
  { name: "number", label: "Номер", type: "text", readonly: true },
  { name: "cost", label: "Вартість", type: "number", readonly: true },
  { name: "orderStatus", label: "Статус", type: "text", readonly: true },
  { name: "paymentType", label: "Оплата", type: "text" },
  {
    name: "orderDateTime",
    label: "Час створення",
    type: "datetime-local",
    readonly: true,
  },
  { name: "estimatedArrivalDate", label: "Дата отримання", type: "date" },
  { name: "estimatedShipmentDate", label: "Дата відправлення", type: "date" },
];

const NEW_PRODUCT_OPTION: ProductData = {
  id: -1,
  concreteProductName: "+ Новий продукт",
  productName: "",
  type: "",
  value: 0,
  weight: 0,
  manufacturer: "",
};

function AutoCostUpdater() {
  const { values, setFieldValue } = useFormikContext<OrderData>();
  useEffect(() => {
    const totalCost = values.products.reduce(
      (sum, item) => sum + item.concreteProduct.value * item.quantity,
      0
    );
    setFieldValue("cost", Number(totalCost.toFixed(2)));
  }, [values.products, setFieldValue]);
  return null;
}

export default function OrderDetailsForm({
  order,
  allProducts,
  onClose,
}: Props) {
  const dispatch = useDispatch();
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(
    null
  );

  const isDeleteMode = useSelector(
    (state: RootState) => state.orderView.isDeleting
  );
  const isEditing = useSelector(
    (state: RootState) => state.orderView.isEditing
  );

  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [productOperations, setProductOperations] = useState<
    Record<string, ProductOperations>
  >({});

  const handleToggleOperations = async (
    productName: string,
    orderNumber: string
  ) => {
    if (expandedProduct === productName) {
      setExpandedProduct(null);
      return;
    }

    if (!productOperations[productName]) {
      try {
        const operations = await fetchProductOperations(
          orderNumber,
          productName
        );

        setProductOperations((prev) => ({
          ...prev,
          [productName]: operations,
        }));
      } catch (error) {
        console.error("Failed to fetch product operations:", error);
        return;
      }
    }

    setExpandedProduct(productName);
  };

  const editDeleteControls = [
    {
      Icon: PenLineIcon,
      onClick: () => {
        dispatch(setDeleteMode(false));
        dispatch(setEditingOrder(true));
      },
      type: "button" as const,
      disabled: isEditing,
    },
    {
      Icon: Trash2Icon,
      onClick: () => {
        dispatch(setEditingOrder(false));
        dispatch(setDeleteMode(true));
      },
      isRed: true,
      type: "button" as const,
    },
  ];

  return (
    <Formik
      initialValues={order}
      validationSchema={validationSchema}
      onSubmit={async (values, { setFieldTouched }) => {
        // вручну торкаємось products, щоб показати помилку
        if (values.products.length === 0) {
          setFieldTouched("products", true, true);
          return;
        }

        const isNew = order.products.length === 0;

        const success = isNew
          ? await createOrder(buildOrderDTO(values))
          : await updateOrder(buildOrderDTO(values));

        if (success) {
          dispatch(triggerTableRefresh());
          dispatch(setEditingOrder(false));
        }
      }}
      enableReinitialize
    >
      {({ values, errors, isValid, resetForm }) => (
        <Form className={styles.form}>
          <AutoCostUpdater />

          <div className={styles.header}>
            <h3>Замовлення {values.number}</h3>
            <ControlButtons
              controls={[
                ...(order.orderStatus === "CREATED" ? editDeleteControls : []),
                {
                  Icon: XIcon,
                  onClick: () => {
                    dispatch(setEditingOrder(false));
                    resetForm();
                    onClose();
                  },
                  type: "button" as const,
                },
              ]}
            />
          </div>

          {isDeleteMode && (
            <div className={styles["delete-action-container"]}>
              <p>
                Ви впевнені, що хочете видалити <br />
                <strong>{order.number}</strong>?
              </p>
              <div className={styles["button-container"]}>
                <TextButton
                  onClick={async () => {
                    try {
                      const res = await fetch(
                        `${
                          import.meta.env.VITE_BACKEND_API_URL
                        }/orders/${encodeURIComponent(order.number)}`,
                        { method: "DELETE" }
                      );

                      if (!res.ok) {
                        const msg = await res.text();
                        throw new Error(msg);
                      }

                      dispatch(triggerTableRefresh());
                      dispatch(setDeleteMode(false));
                      onClose();
                    } catch (error) {
                      alert(
                        "Не вдалося видалити замовлення: " +
                          (error as Error).message
                      );
                    }
                  }}
                  textValue="Видалити"
                  isSmall
                />
                <TextButton
                  isSmall
                  onClick={() => dispatch(setDeleteMode(false))}
                  textValue="Скасувати"
                  isSecondary
                />
              </div>
            </div>
          )}

          <div className={styles["attribute-list-container"]}>
            {orderFields.map((field) => {
              const key = field.name as keyof OrderData;
              const rawValue = values[key];
              const formattedValue =
                field.type === "datetime-local" && typeof rawValue === "string"
                  ? rawValue.slice(0, 16)
                  : rawValue;

              return (
                <div key={key} className={styles["attribute-container"]}>
                  <label htmlFor={key}>{field.label}</label>
                  <Field
                    id={key}
                    name={key}
                    disabled={!isEditing || field.readonly}
                    type={field.type}
                    value={formattedValue}
                  />
                </div>
              );
            })}

            <div className={styles["attribute-container"]}>
              <label htmlFor="supplier">Постачальник</label>
              <AsyncAutocompleteInput
                name="supplier"
                disabled={!isEditing}
                fetchUrl={`${
                  import.meta.env.VITE_BACKEND_API_URL
                }/suppliers/names`}
              />
            </div>
          </div>

          <FieldArray name="products">
            {({ remove, push, replace }) => (
              <div className={styles["list-container"]}>
                <h4>Продукти</h4>

                {isEditing && (
                  <div className={styles["list-addition-controls"]}>
                    <Autocomplete
                      disablePortal
                      options={[
                        NEW_PRODUCT_OPTION,
                        ...allProducts.filter(
                          (p) =>
                            !values.products.find(
                              (prod) =>
                                prod.concreteProduct.concreteProductName ===
                                p.concreteProductName
                            )
                        ),
                      ]}
                      getOptionLabel={(option) => option.concreteProductName}
                      onChange={(_event, value) => {
                        if (value?.concreteProductName === "+ Новий продукт") {
                          dispatch(createProduct());
                        } else if (value) {
                          setSelectedProduct(value);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Пошук продукту"
                          size="small"
                        />
                      )}
                      sx={{ width: 320 }}
                    />
                    <TextButton
                      type="button"
                      onClick={() => {
                        if (selectedProduct) {
                          push({
                            concreteProduct: selectedProduct,
                            quantity: 1,
                          });
                          setSelectedProduct(null);
                        } else {
                          dispatch(createProduct());
                        }
                      }}
                      textValue="Додати"
                    />
                  </div>
                )}

                <div className={styles["product-list"]}>
                  {values.products.map((item, index) => {
                    const productName =
                      item.concreteProduct.concreteProductName;
                    const isExpanded = expandedProduct === productName;
                    const ops = productOperations[productName];

                    return (
                      <div className={styles["productItem"]} key={index}>
                        <label
                          className={styles["clickable-product-name"]}
                          onClick={() =>
                            dispatch(viewProduct(item.concreteProduct))
                          }
                        >
                          {productName}
                        </label>

                        <div className={styles.counter}>
                          {isEditing && (
                            <>
                              <RoundIconButton
                                type="button"
                                onClick={() =>
                                  replace(index, {
                                    ...item,
                                    quantity: Math.max(1, item.quantity - 1),
                                  })
                                }
                                Icon={MinusIcon}
                              />
                            </>
                          )}
                          <div
                            className={styles["counter-value"]}
                          >{`${item.quantity} шт.`}</div>
                          {isEditing && (
                            <RoundIconButton
                              type="button"
                              onClick={() =>
                                replace(index, {
                                  ...item,
                                  quantity: item.quantity + 1,
                                })
                              }
                              Icon={PlusIcon}
                            />
                          )}
                        </div>

                        {!isEditing ? (
                          <div className={styles["expansion-toggle-btn"]}>
                            <RoundIconButton
                              type="button"
                              onClick={() =>
                                handleToggleOperations(
                                  productName,
                                  values.number
                                )
                              }
                              Icon={
                                isExpanded ? ChevronUpIcon : ChevronDownIcon
                              }
                            />
                          </div>
                        ) : (
                          <TextButton
                            type="button"
                            onClick={() => remove(index)}
                            textValue="Вилучити"
                            isSecondary
                          />
                        )}

                        {isExpanded && ops && (
                          <div className={styles["operations-container"]}>
                            <h5>Розміщення</h5>
                            {ops.placements.length === 0 ? (
                              <p>Немає</p>
                            ) : (
                              <ul>
                                {ops.placements.map(
                                  (plc: ProductPlacementData, i: number) => (
                                    <li key={i}>
                                      {plc.quantity} шт. — кімн.{" "}
                                      {plc.roomNumber}, лот {plc.lotNumber}
                                    </li>
                                  )
                                )}
                              </ul>
                            )}

                            <h5>Відвантаження</h5>
                            {ops.shipments.length === 0 ? (
                              <p>Немає</p>
                            ) : (
                              <ul>
                                {ops.shipments.map(
                                  (shp: ProductShipmentData, i: number) => (
                                    <li key={i}>
                                      {shp.quantity} шт. — кімн.{" "}
                                      {shp.roomNumber}, лот {shp.lotNumber}
                                    </li>
                                  )
                                )}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isEditing && errors.products && (
                  <div className={styles.error}>
                    {errors.products as string}
                  </div>
                )}
              </div>
            )}
          </FieldArray>

          {isEditing && (
            <div className={styles["button-container"]}>
              <TextButton
                type="button"
                onClick={() => {
                  resetForm();
                  dispatch(setEditingOrder(false));
                }}
                textValue="Скасувати"
                isSecondary
              />
              <TextButton
                type="submit"
                disabled={!isValid}
                textValue="Зберегти"
              />
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
}

const createOrder = async (dto: OrderDTO): Promise<boolean> => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      const msg = await res.text();
      console.error("Помилка створення:", msg);
      return false;
    }

    return true;
  } catch (e) {
    console.error("Мережна помилка:", e);
    return false;
  }
};

const updateOrder = async (dto: OrderDTO): Promise<boolean> => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/orders/${encodeURIComponent(
        dto.number
      )}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      }
    );

    if (!res.ok) {
      const msg = await res.text();
      console.error("Помилка оновлення:", msg);
      return false;
    }

    return true;
  } catch (e) {
    console.error("Мережна помилка:", e);
    return false;
  }
};

function buildOrderDTO(values: OrderData): OrderDTO {
  return {
    number: values.number,
    cost: values.cost,
    orderDateTime: values.orderDateTime,
    estimatedArrivalDate: values.estimatedArrivalDate,
    estimatedShipmentDate: values.estimatedShipmentDate,
    supplier: values.supplier,
    paymentType: values.paymentType,
    orderStatus: values.orderStatus,
    products: values.products.map((item) => ({
      orderNumber: item.orderNumber,
      quantity: item.quantity,
      concreteProduct: {
        id: item.concreteProduct.id,
        concreteProductName: item.concreteProduct.concreteProductName,
        productName: item.concreteProduct.productName,
        type: item.concreteProduct.type,
        value: item.concreteProduct.value,
        weight: item.concreteProduct.weight,
        manufacturer: item.concreteProduct.manufacturer,
      },
    })),
  };
}
