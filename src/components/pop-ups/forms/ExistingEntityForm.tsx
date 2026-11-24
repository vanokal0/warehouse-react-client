import { Formik, Form, Field, FormikProps } from "formik";
import {
  date,
  DateSchema,
  number,
  NumberSchema,
  object,
  string,
  StringSchema,
} from "yup";
import { useDispatch, useSelector } from "react-redux";
import {
  acknowledgeReset,
  backToView,
  closeModal,
  FormEntityData,
} from "../../../store/slices/modalSlice";
import styles from "./ExistingEntityForm.module.css";
import TextButton from "../../buttons/TextButton";
import { RootState } from "../../../store/store";
import { useEffect, useRef } from "react";
import AsyncAutocompleteInput from "./input/AsyncAutocompleteInput";
import {
  addEmployee,
  addParkingLot,
  addRoom,
  updateEmployee,
  updateParkingLot,
  updateRoom,
} from "../../../store/slices/warehouseSlice";
import {
  addWarehouse,
  updateWarehouse,
} from "../../../store/slices/networkSlice";
import {
  addPlacement,
  addShipment,
  updatePlacement,
  updateShipment,
} from "../../../store/slices/orderLogisticsSlice";
import { triggerLotBookingsRefresh } from "../../../store/slices/lotBookingSlice";

type Props = {
  editable: boolean;
  entityData: FormEntityData;
};

export default function ExistingEntityForm({ editable, entityData }: Props) {
  const dispatch = useDispatch();
  const { isResetRequired, isCreate } = useSelector(
    (state: RootState) => state.modal
  );
  const formikRef = useRef<FormikProps<Record<string, string>>>(null);

  useEffect(() => {
    if (isResetRequired && formikRef.current) {
      formikRef.current.resetForm();
      dispatch(acknowledgeReset());
    }
  }, [isResetRequired, dispatch]);

  if (!entityData) {
    return <div>Unknown entity type</div>;
  }

  const validationSchema = object(
    entityData.attributes
      .filter((attr) => !attr.readonly)
      .reduce<Record<string, StringSchema | NumberSchema | DateSchema>>(
        (acc, attr) => {
          const label = attr.displayName || attr.name;
          let validator;

          switch (attr.type) {
            case "number":
              validator = number()
                .min(1, `${label} має бути не менше 1`)
                .typeError(`${label} має бути числом`)
                .required(`${label} є обов’язковим`);
              break;
            case "date":
            case "datetime-local":
              validator = date()
                .typeError(`${label} має бути датою`)
                .required(`${label} є обов’язковим`);
              break;
            default:
              validator = string().required(`${label} є обов’язковим`);
          }

          acc[attr.name] = validator;
          return acc;
        },
        {}
      )
  );

  const handleSubmit = async (values: Record<string, string>) => {
    const identifier = entityData.attributes.find(
      (att) => att.name === entityData.fetchAttribute
    )?.value;

    const url = isCreate
      ? entityData.createUrl
      : `${entityData.updateUrl}/${identifier}`;

    const method = isCreate ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error(await response.text());

      const updated = await response.json();

      // === Оновлення Redux ===
      const urlBase = entityData.createUrl;

      if (urlBase.includes("rooms")) {
        dispatch(isCreate ? addRoom(updated) : updateRoom(updated));
      } else if (urlBase.includes("parking-lots")) {
        dispatch(isCreate ? addParkingLot(updated) : updateParkingLot(updated));
      } else if (urlBase.includes("employees")) {
        dispatch(isCreate ? addEmployee(updated) : updateEmployee(updated));
      } else if (urlBase.includes("warehouses")) {
        dispatch(isCreate ? addWarehouse(updated) : updateWarehouse(updated));
      } else if (urlBase.includes("product-placements")) {
        const product = `${
          entityData.attributes.find((attr) => attr.name === "product")?.value
        }`;
        dispatch(
          isCreate
            ? addPlacement({ productId: product, data: updated })
            : updatePlacement({ productId: product, data: updated })
        );
      } else if (urlBase.includes("product-shipments")) {
        const product = `${
          entityData.attributes.find((attr) => attr.name === "product")?.value
        }`;
        dispatch(
          isCreate
            ? addShipment({ productId: product, data: updated })
            : updateShipment({ productId: product, data: updated })
        );
      } else if (entityData.createUrl.includes("lot-bookings")) {
        dispatch(triggerLotBookingsRefresh());
      }

      dispatch(backToView());
      dispatch(closeModal());
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const formatDate = (value: string | number | Date, type?: string) => {
    if (!value) return "";

    const date = new Date(value);

    if (type === "date") {
      return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
    }

    if (type === "datetime-local") {
      const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
    }

    return `${value}`;
  };

  const initialValues = entityData.attributes.reduce<Record<string, string>>(
    (acc, attr) => {
      acc[attr.name] = attr.value ? formatDate(attr.value, attr.type) : "";
      return acc;
    },
    {}
  );

  return (
    <Formik
      innerRef={formikRef}
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isValid, resetForm }) => (
        <Form className={styles["form"]}>
          {entityData.attributes.map(
            (attr) =>
              attr.displayName && (
                <>
                  <label htmlFor={attr.name}>{attr.displayName}</label>
                  <div key={attr.name} className={styles["field-container"]}>
                    {attr.fetchOptionsUrl ? (
                      <AsyncAutocompleteInput
                        name={attr.name}
                        disabled={(!editable || attr.readonly) ?? false}
                        fetchUrl={attr.fetchOptionsUrl}
                      />
                    ) : (
                      <Field
                        id={attr.name}
                        name={attr.name}
                        type={attr.type ?? "text"}
                        disabled={!editable || attr.readonly}
                        className={`${
                          editable && touched[attr.name] && errors[attr.name]
                            ? styles["error-border"]
                            : ""
                        }`}
                      />
                    )}
                    <div className={styles["error"]}>
                      {editable && touched[attr.name] && errors[attr.name]
                        ? errors[attr.name]
                        : ""}
                    </div>
                  </div>
                </>
              )
          )}

          {editable && (
            <div className={styles["button-container"]}>
              {!isCreate && (
                <TextButton
                  type="button"
                  onClick={() => {
                    resetForm();
                    dispatch(backToView());
                  }}
                  textValue="Скасувати"
                  isSecondary={true}
                />
              )}
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
