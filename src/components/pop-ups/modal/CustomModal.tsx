import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store"; // шлях до твого rootReducer
import {
  closeModal,
  switchToEdit,
  switchToDelete,
  backToView,
  triggerFormReset,
} from "../../../store/slices/modalSlice";
import ExistingEntityForm from "../forms/ExistingEntityForm";
import styles from "./CustomModal.module.css";
import { useEffect, useRef } from "react";
import ControlButtons, {
  ControlButtonsData,
} from "../../buttons/ControlButtons";
import { PenLineIcon, Trash2Icon, XIcon } from "lucide-react";
import TextButton from "../../buttons/TextButton";
import {
  removeEmployee,
  removeParkingLot,
  removeRoom,
} from "../../../store/slices/warehouseSlice";
import { removeWarehouse } from "../../../store/slices/networkSlice";
import {
  deletePlacement,
  deleteShipment,
} from "../../../store/slices/orderLogisticsSlice";
import { triggerLotBookingsRefresh } from "../../../store/slices/lotBookingSlice";

const CustomModal = () => {
  const dispatch = useDispatch();
  const { isOpen, mode, formData, isCreate, modalHeader } = useSelector(
    (state: RootState) => state.modal
  );

  const modalControlsData: ControlButtonsData[] = [
    {
      Icon: PenLineIcon,
      onClick: () => dispatch(switchToEdit()),
    },
    {
      Icon: Trash2Icon,
      onClick: () => dispatch(switchToDelete()),
      isRed: true,
    },
    {
      Icon: XIcon,
      onClick: () => {
        dispatch(triggerFormReset());
        dispatch(closeModal());
      },
    },
  ];

  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const modal = dialog.current;

    if (modal) {
      if (isOpen) {
        modal.showModal();
      }
      return () => modal.close();
    }
  }, [isOpen]);

  if (!formData) return null;

  const handleDelete = async () => {
    if (!formData) return;

    const titleKey = formData.fetchAttribute;
    const identifier = formData.attributes.find(
      (attr) => attr.name === titleKey
    )?.value;
    if (!identifier) return;

    const url = `${formData.deleteUrl}/${identifier}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(await response.text());

      if (formData.deleteUrl.includes("rooms")) {
        dispatch(removeRoom(`${identifier}`));
      } else if (formData.deleteUrl.includes("employees")) {
        dispatch(removeEmployee(`${identifier}`));
      } else if (formData.deleteUrl.includes("parking-lots")) {
        dispatch(removeParkingLot(`${identifier}`));
      } else if (formData.deleteUrl.includes("warehouses")) {
        dispatch(
          removeWarehouse(typeof identifier === "number" ? identifier : -1)
        );
      } else if (formData.deleteUrl.includes("product-shipments")) {
        const productId = `${
          formData.attributes.find((a) => a.name === "product")?.value
        }`;
        const id = `${
          formData.attributes.find((a) => a.name === "number")?.value
        }`;
        dispatch(deleteShipment({ productId, id }));
      } else if (formData.deleteUrl.includes("product-placements")) {
        const productId = `${
          formData.attributes.find((a) => a.name === "product")?.value
        }`;
        const id = `${
          formData.attributes.find((a) => a.name === "number")?.value
        }`;
        dispatch(deletePlacement({ productId, id }));
      } else if (formData.deleteUrl.includes("lot-bookings")) {
        dispatch(triggerLotBookingsRefresh());
      }

      dispatch(closeModal());
    } catch (error) {
      alert((error as Error).message);
      dispatch(backToView());
    }
  };

  const formTitle = formData.attributes.find(
    (attr) => attr.name === formData.titleAttributte
  )?.value;

  return (
    <dialog ref={dialog} className={styles["modal"]}>
      <div className={styles["content-container"]}>
        <div className={styles["modal-header"]}>
          <h2>{!isCreate ? formTitle : modalHeader}</h2>

          <ControlButtons
            controls={
              isCreate
                ? [modalControlsData[modalControlsData.length - 1]]
                : modalControlsData
            }
          />
        </div>
        <div className={styles["delete-action-container"]}>
          {mode === "delete" && (
            <>
              <p>
                {"Ви впевнені, що хочете видалити "}
                <br />
                <strong>{formTitle}</strong>?
              </p>
              <div className={styles["button-container"]}>
                <TextButton
                  onClick={handleDelete}
                  textValue="Видалити"
                  isSmall
                />
                <TextButton
                  isSmall
                  onClick={() => dispatch(backToView())}
                  textValue="Скасувати"
                  isSecondary={true}
                />
              </div>
            </>
          )}
        </div>
        <div>
          {formData && (
            <ExistingEntityForm
              editable={mode === "edit"}
              entityData={formData}
            />
          )}
        </div>
      </div>
    </dialog>
  );
};

export default CustomModal;
