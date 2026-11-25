import { GridColDef } from "@mui/x-data-grid";
import {
  LoadingDockData,
  LotBookingData,
  ParkingLotData,
  WarehouseData,
} from "../../../typing";
import styles from "./MultipleLogisticsPage.module.css";
import EntityInteractiveTable from "../../tables/EntityInteractiveTable";
import TextButton from "../../buttons/TextButton";
import PaginatedSearchableList from "../../lists/PaginatedSearchableList";
import { EyeIcon, TruckIcon } from "lucide-react";
import SingleAttributeCard from "../../cards/single-attribute/SingleAttributeCard";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedLotNumber } from "../../../store/slices/lotBookingSlice";
import { RootState } from "../../../store/store";

import { createNewEntity, openModal } from "../../../store/slices/modalSlice";
import IconedPlaceholder from "../../sections/IconedPlaceholder";

const getLotBookingId = (booking: LotBookingData) => booking.number;

export default function MultipleLogisticsPage() {
  const warehouseNumber = useSelector(
    (state: RootState) => state.auth.warehouseNumber
  );
  const refreshKey = useSelector(
    (state: RootState) => state.lotBooking.refreshKey
  );
  const [warehouse, setWarehouse] = useState<WarehouseData | null>(null);
  useEffect(() => {
    const fetchWarehouse = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/warehouses/${warehouseNumber}`
      );
      const data = await res.json();
      setWarehouse(data);
    };

    fetchWarehouse();
  }, [warehouseNumber]);

  const dispatch = useDispatch();

  const selectedLotNumber = useSelector(
    (state: RootState) => state.lotBooking.selectedLotNumber
  );

  const lotBookingColumns: GridColDef<LotBookingData>[] = [
    { field: "number", headerName: "Номер броні", flex: 1, type: "string" },
    { field: "lotNumber", headerName: "Паркомісце", flex: 1, type: "string" },
    {
      field: "supplierName",
      headerName: "Постачальник",
      flex: 1.2,
      type: "string",
    },
    {
      field: "bookingDateTime",
      headerName: "Дата бронювання",
      flex: 1,
      valueGetter: (value: string) => new Date(value),
      type: "date",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "startDateTime",
      headerName: "Початок",
      flex: 1.2,
      valueGetter: (value: string) => new Date(value),
      type: "dateTime",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "endDateTime",
      headerName: "Завершення",
      flex: 1.2,
      valueGetter: (value: string) => new Date(value),
      type: "dateTime",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "actions",
      headerName: "Дії",
      sortable: false,
      filterable: false,
      flex: 0.6,
      minWidth: 82,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <TextButton
          isSmall
          onClick={() =>
            dispatch(openModal({ entity: params.row, type: "Lot Booking" }))
          }
          textValue="Деталі"
        />
      ),
    },
  ];

  return (
    <div className={styles["page-container"]}>
      <section className={styles["lot-section"]}>
        {warehouse && (
          <PaginatedSearchableList
            data={warehouse.loadingDocks.flatMap(
              (dock: LoadingDockData) => dock.parkingLots
            )}
            renderItem={(lot: ParkingLotData) => (
              <SingleAttributeCard
                title={lot.number}
                attribute={{ Icon: TruckIcon, value: lot.type }}
                controls={[
                  {
                    Icon: EyeIcon,
                    onClick: () => dispatch(setSelectedLotNumber(lot.number)),
                  },
                ]}
              />
            )}
            getKey={(lot: ParkingLotData) => lot.number}
            title={`Паркувальні лоти (Склад ${warehouseNumber})`}
          />
        )}
      </section>
      <section className={styles["booking-section"]}>
        {selectedLotNumber ? (
          <EntityInteractiveTable<LotBookingData>
            title={`Бронювання лоту ${selectedLotNumber}`}
            refreshToken={refreshKey}
            dataUrl={`${
              import.meta.env.VITE_BACKEND_API_URL
            }/lot-bookings/by-lot/${selectedLotNumber}`}
            columns={lotBookingColumns}
            idAccessor={getLotBookingId}
            exportType="lotBookings"
            renderHeaderButtons={() => (
              <TextButton
                textValue="+ Додати"
                onClick={() =>
                  dispatch(
                    createNewEntity({
                      type: "Lot Booking",
                      initialAttributes: new Map([
                        ["lotNumber", selectedLotNumber],
                      ]),
                      headerText: "Нове бронювання",
                    })
                  )
                }
              />
            )}
            pageSize={11}
          />
        ) : (
          <IconedPlaceholder
            textValue="Оберіть паркувальний лот, щоб переглянути бронювання"
            Icon={TruckIcon}
          />
        )}
      </section>
    </div>
  );
}
