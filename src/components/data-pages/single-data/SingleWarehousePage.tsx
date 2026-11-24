import { LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router";
import {
  EmployeeData,
  LoadingDockData,
  ParkingLotData,
  RoomData,
  WarehouseData,
} from "../../../typing";
import WarehouseGoogleMap from "../../maps/WarehouseGoogleMap";
import styles from "./SingleWarehousePage.module.css";
import PaginatedSearchableList from "../../lists/PaginatedSearchableList";
import SingleAttributeCard from "../../cards/single-attribute/SingleAttributeCard";
import MultipleAttributeCard from "../../cards/multiple-attribute/MultipleAttributeCard";
import {
  BoxesIcon,
  DropletsIcon,
  DrumstickIcon,
  EllipsisIcon,
  HammerIcon,
  SunSnowIcon,
  TruckIcon,
} from "lucide-react";
import { createNewEntity, openModal } from "../../../store/slices/modalSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { setWarehouse } from "../../../store/slices/warehouseSlice";
import { useEffect } from "react";

const WarehouseSinglePage = () => {
  const loaderWarehouse: WarehouseData = useLoaderData();
  const warehouse = useSelector(
    (state: RootState) => state.warehouse.selectedWarehouse
  );

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (
      user.isAuthenticated &&
      user.role !== "Warehouse Manager" &&
      user.warehouseNumber !== loaderWarehouse.number
    ) {
      navigate(`/warehouse/${user.warehouseNumber}`, { replace: true });
    }
  }, [user, loaderWarehouse, navigate]);

  useEffect(() => {
    dispatch(setWarehouse(loaderWarehouse));
  }, [dispatch, loaderWarehouse]);

  const handleOpenEmployeeModal = (employee: EmployeeData) => {
    dispatch(
      openModal({
        entity: employee,
        type: "Employee",
      })
    );
  };

  const handleOpenRoomModal = (room: RoomData) => {
    dispatch(
      openModal({
        entity: room,
        type: "Room",
      })
    );
  };

  const handleOpenParkingLotModal = (parkingLot: ParkingLotData) => {
    dispatch(openModal({ entity: parkingLot, type: "Parking Lot" }));
  };

  if (!warehouse) {
    return <h1>Warehouse not found</h1>;
  }

  const isManager = user.role === "Warehouse Manager";

  return (
    <div className={styles["page-container"]}>
      <section className={styles["map-section"]}>
        <WarehouseGoogleMap warehouses={[warehouse]} />
      </section>
      <section className={styles["room-section"]}>
        <PaginatedSearchableList
          data={warehouse.rooms}
          renderItem={(room: RoomData) => (
            <MultipleAttributeCard
              title={room.number}
              mainAttribute={{ value: room.type, Icon: DrumstickIcon }}
              sideAttributes={[
                {
                  value: `${room.availableSpace}`,
                  Icon: BoxesIcon,
                },
                { value: room.temperature, Icon: SunSnowIcon },
                {
                  value: `${room.humidity}`,
                  Icon: DropletsIcon,
                },
              ]}
              controls={
                isManager
                  ? [
                      {
                        Icon: EllipsisIcon,
                        onClick: () => handleOpenRoomModal(room),
                      },
                    ]
                  : []
              }
            />
          )}
          getKey={(room: RoomData) => room.number}
          title="Кімнати"
          layout="grid"
          columnsAmount={2}
          {...(isManager && {
            onAddNew: () => {
              dispatch(
                createNewEntity({
                  type: "Room",
                  initialAttributes: new Map([
                    ["warehouseNumber", warehouse.number],
                  ]),
                  headerText: "Нова кімната",
                })
              );
            },
          })}
        />
      </section>
      <section className={styles["lot-section"]}>
        <PaginatedSearchableList
          data={warehouse.loadingDocks.flatMap(
            (dock: LoadingDockData) => dock.parkingLots
          )}
          renderItem={(lot: ParkingLotData) => (
            <SingleAttributeCard
              title={lot.number}
              attribute={{ Icon: TruckIcon, value: lot.type }}
              controls={
                isManager
                  ? [
                      {
                        Icon: EllipsisIcon,
                        onClick: () => handleOpenParkingLotModal(lot),
                        style: {
                          color: "#6a343c",
                          backgroundColor: "#faf5f7",
                        },
                      },
                    ]
                  : []
              }
              themeColor="#bf718e"
            />
          )}
          themeColor="red"
          hcolor="#6a343c"
          getKey={(lot: ParkingLotData) => lot.number}
          title="Паркувальні лоти"
          itemsPerPage={2}
          {...(isManager && {
            onAddNew: () => {
              dispatch(
                createNewEntity({
                  type: "Parking Lot",
                  initialAttributes: new Map([
                    ["warehouseNumber", warehouse.number],
                  ]),
                  headerText: "Новий  лот",
                })
              );
            },
          })}
        />
      </section>
      <section className={styles["employee-section"]}>
        <PaginatedSearchableList
          data={warehouse.employees}
          renderItem={(employee: EmployeeData) => (
            <SingleAttributeCard
              title={employee.fullName}
              attribute={{ Icon: HammerIcon, value: employee.position }}
              controls={
                isManager
                  ? [
                      {
                        Icon: EllipsisIcon,
                        onClick: () => handleOpenEmployeeModal(employee),
                        style: {
                          color: "#71BFA2",
                          backgroundColor: "#F5FAF8",
                        },
                      },
                    ]
                  : []
              }
              themeColor="#71BFA2"
              attrThemeColor="#346a62"
            />
          )}
          getKey={(employee: EmployeeData) => employee.fullName}
          title="Працівники"
          themeColor="green"
          hcolor="#346a62"
          itemsPerPage={5}
          {...(isManager && {
            onAddNew: () => {
              dispatch(
                createNewEntity({
                  type: "Employee",
                  initialAttributes: new Map([
                    ["warehouseNumber", warehouse.number],
                  ]),
                  headerText: "Новий  працівник",
                })
              );
            },
          })}
        />
      </section>
    </div>
  );
};

export async function singleWarehouseLoader({ params }: LoaderFunctionArgs) {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}/warehouses/${
      params.warehouseNumber
    }`
  );

  if (!response.ok) {
    throw new Response("Could not fetch warehouse data.", { status: 500 });
  }

  const warehouse = await response.json();
  return warehouse;
}

export default WarehouseSinglePage;
