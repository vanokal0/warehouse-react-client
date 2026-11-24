import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { ProductData } from "../../../typing";
import styles from "./ProductDetailsForm.module.css";
import RoundIconButton from "../../buttons/RoundIconButton";
import { MoveLeftIcon, PenLineIcon } from "lucide-react";
import TextButton from "../../buttons/TextButton";
import AsyncAutocompleteInput from "../forms/input/AsyncAutocompleteInput";
import {
  addProductToOrder,
  backToOrder,
  updateProductInOrder,
} from "../../../store/slices/orderViewSlice";
import { useDispatch } from "react-redux";

type Props = {
  product: ProductData | null;
};

const validationSchema = yup.object().shape({
  concreteProductName: yup.string().required("Обов’язково"),
  productName: yup.string().required("Обов’язково"),
  type: yup.string().required("Обов’язково"),
  manufacturer: yup.string().required("Обов’язково"),
  value: yup.number().required("Обов’язково").min(1, "Від'ємна ціна"),
  weight: yup.number().required("Обов’язково").min(0, "Від'ємна вага"),
});

const defaultValues: ProductData = {
  concreteProductName: "",
  productName: "",
  type: "",
  manufacturer: "",
  value: 0,
  weight: 0,
  id: -1,
};

export default function ProductDetailsForm({ product }: Props) {
  const dispatch = useDispatch();
  const isNew = product === null;
  const [isEditing, setIsEditing] = useState(isNew);

  useEffect(() => {
    setIsEditing(isNew);
  }, [isNew]);

  return (
    <Formik
      initialValues={product ?? defaultValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        if (isNew) {
          const created = await createProduct(values);
          if (created) {
            dispatch(addProductToOrder(created));
          }
        } else {
          const updated = await updateProduct(values);
          if (updated) {
            dispatch(updateProductInOrder(updated));
          }
        }
        setIsEditing(false);
        dispatch(backToOrder());
      }}
      enableReinitialize
    >
      {({ isValid, resetForm }) => (
        <Form className={styles["form-container"]}>
          <div className={styles["container-header"]}>
            <RoundIconButton
              Icon={MoveLeftIcon}
              onClick={() => {
                setIsEditing(isNew);
                resetForm();
                dispatch(backToOrder());
              }}
              type="button"
            />
            <h3>{isNew ? "Новий продукт" : product!.concreteProductName}</h3>
            {!isNew && (
              <div className={styles["header-controls"]}>
                <RoundIconButton
                  Icon={PenLineIcon}
                  onClick={() => setIsEditing(true)}
                  disabled={isEditing}
                  type="button"
                />
                {/* <RoundIconButton
                  Icon={Trash2Icon}
                  onClick={() => console.log("Видалення продукту")}
                  isRed
                  type="button"
                /> */}
              </div>
            )}
          </div>

          <div className={styles["attribute-list-container"]}>
            <div className={styles["attribute-container"]}>
              <label htmlFor="concreteProductName">Назва</label>
              <Field
                id="concreteProductName"
                name="concreteProductName"
                type="text"
                disabled={!isEditing}
              />
              <ErrorMessage
                name="concreteProductName"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles["attribute-container"]}>
              <label htmlFor="productName">Продукт</label>
              <AsyncAutocompleteInput
                name="productName"
                disabled={!isEditing}
                fetchUrl={`${
                  import.meta.env.VITE_BACKEND_API_URL
                }/products/names`}
              />
              <ErrorMessage
                name="productName"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles["attribute-container"]}>
              <label htmlFor="type">Тип</label>
              <AsyncAutocompleteInput
                name="type"
                disabled={!isEditing}
                fetchUrl={`${
                  import.meta.env.VITE_BACKEND_API_URL
                }/product-types/type-names`}
              />
              <ErrorMessage
                name="type"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles["attribute-container"]}>
              <label htmlFor="manufacturer">Виробник</label>
              <AsyncAutocompleteInput
                name="manufacturer"
                disabled={!isEditing}
                fetchUrl={`${
                  import.meta.env.VITE_BACKEND_API_URL
                }/manufacturers/names`}
              />
              <ErrorMessage
                name="manufacturer"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles["attribute-container"]}>
              <label htmlFor="value">Ціна</label>
              <Field
                id="value"
                name="value"
                type="number"
                disabled={!isEditing}
              />
              <ErrorMessage
                name="value"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles["attribute-container"]}>
              <label htmlFor="weight">Вага</label>
              <Field
                id="weight"
                name="weight"
                type="number"
                disabled={!isEditing}
              />
              <ErrorMessage
                name="weight"
                component="div"
                className={styles.error}
              />
            </div>
          </div>

          {isEditing && (
            <div className={styles["button-container"]}>
              {!isNew && (
                <TextButton
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsEditing(false);
                  }}
                  textValue="Скасувати"
                  isSecondary
                />
              )}
              <TextButton
                type="submit"
                textValue="Зберегти"
                disabled={!isValid}
              />
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
}

const updateProduct = async (dto: ProductData): Promise<ProductData | null> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/concrete-products/${dto.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      alert(text);
      return null;
    }

    const updated = await response.json();
    return updated;
  } catch (error) {
    console.error("Помилка мережі при оновленні:", error);
    return null;
  }
};

const createProduct = async (dto: ProductData): Promise<ProductData | null> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/concrete-products`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          concreteProductName: dto.concreteProductName,
          productName: dto.productName,
          type: dto.type,
          value: dto.value,
          weight: dto.weight,
          manufacturer: dto.manufacturer,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Помилка створення продукту:", text);
      return null;
    }

    const createdProduct = await response.json();
    return createdProduct;
  } catch (error) {
    console.error("Помилка мережі при створенні:", error);
    return null;
  }
};
