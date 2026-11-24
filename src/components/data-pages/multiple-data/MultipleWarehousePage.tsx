import IconInfoCard from "../../cards/IconInfoCard";
import {
  WarehouseIcon,
  PersonStandingIcon,
  DoorOpenIcon,
  TruckIcon,
  MapPinIcon,
  UserRoundIcon,
  ExternalLinkIcon,
  EllipsisIcon,
} from "lucide-react";
import styles from "./MultipleWarehousePage.module.css";
import MultipleAttributeCard from "../../cards/multiple-attribute/MultipleAttributeCard";
import { WarehouseData } from "../../../typing";
import { useLoaderData, useNavigate } from "react-router";
import WarehouseGoogleMap from "../../maps/WarehouseGoogleMap";
import PaginatedSearchableList from "../../lists/PaginatedSearchableList";
import { createNewEntity, openModal } from "../../../store/slices/modalSlice";
import { AppDispatch, RootState } from "../../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setWarehouses } from "../../../store/slices/networkSlice";

export default function MultipleWarehousePage() {
  const navigate = useNavigate();
  const loaderWarehouses = useLoaderData() as WarehouseData[];
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(setWarehouses(loaderWarehouses));
  }, [dispatch, loaderWarehouses]);

  const warehouses = useSelector((state: RootState) => state.network);

  const handleOpenModal = (warehouse: WarehouseData) => {
    dispatch(
      openModal({
        entity: warehouse,
        type: "Warehouse",
      })
    );
  };

  return (
    <div className={styles["page-container"]}>
      <div className={styles["card-container"]}>
        <IconInfoCard
          title="Склади"
          value={warehouses.length}
          Icon={WarehouseIcon}
          color="#396AFF"
        />
        <IconInfoCard
          title="Працівники"
          value={warehouses.reduce(
            (accum, warehouse: WarehouseData) =>
              accum + warehouse.employees.length,
            0
          )}
          Icon={PersonStandingIcon}
          color="#FFBB38"
        />
        <IconInfoCard
          title="Кімнати"
          value={warehouses.reduce(
            (accum, warehouse: WarehouseData) => accum + warehouse.rooms.length,
            0
          )}
          Icon={DoorOpenIcon}
          color="#FF82AC"
        />
        <IconInfoCard
          title="Лоти"
          value={warehouses.reduce(
            (accum, warehouse: WarehouseData) =>
              accum +
              warehouse.loadingDocks.reduce(
                (accumLot, dock) => accumLot + dock.parkingLots.length,
                0
              ),
            0
          )}
          Icon={TruckIcon}
          color="#16DBCC"
        />
      </div>

      <div className={styles["warehouse-list-section"]}>
        <div className={styles["list-container"]}>
          <PaginatedSearchableList
            data={warehouses}
            renderItem={(warehouse: WarehouseData) => (
              <MultipleAttributeCard
                title={warehouse.number}
                mainAttribute={{ value: warehouse.address, Icon: MapPinIcon }}
                sideAttributes={[
                  {
                    value: `${warehouse.employees.length}`,
                    Icon: UserRoundIcon,
                  },
                  { value: `${warehouse.rooms.length}`, Icon: DoorOpenIcon },
                  {
                    value: `${
                      warehouse.loadingDocks.flatMap((dock) => dock.parkingLots)
                        .length
                    }`,
                    Icon: TruckIcon,
                  },
                ]}
                controls={[
                  {
                    Icon: EllipsisIcon,
                    onClick: () => handleOpenModal(warehouse),
                  },
                  {
                    Icon: ExternalLinkIcon,
                    onClick: () => {
                      navigate(`/warehouse/${warehouse.number}`);
                    },
                  },
                ]}
              />
            )}
            getKey={(warehouse: WarehouseData) => warehouse.number}
            title="Склади"
            layout="list"
            onAddNew={() => {
              dispatch(
                createNewEntity({
                  type: "Warehouse",
                  headerText: "Новий  склад",
                })
              );
            }}
          />
        </div>
        <div className={styles["map-container"]}>
          <WarehouseGoogleMap warehouses={warehouses} />
        </div>
      </div>
    </div>
  );
}

export async function multipleWarehouseLoader() {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}/warehouses`
  );

  if (!response.ok) {
    throw new Response("Could not fetch warehouse data.", { status: 500 });
  }

  const warehouses = await response.json();
  return warehouses;
}
