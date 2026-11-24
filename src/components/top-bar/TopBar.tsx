import { useLocation, useMatch, useNavigate } from "react-router-dom";
import { DownloadIcon, LogOutIcon } from "lucide-react";
import styles from "./TopBar.module.css";
import RoundIconButton from "../buttons/RoundIconButton";
import { logout } from "../../store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const warehouseMatch = useMatch("/warehouse/:warehouseNumber");

  const warehouse = useSelector(
    (state: RootState) => state.warehouse.selectedWarehouse
  );
  const user = useSelector((state: RootState) => state.auth);

  let heading: string | undefined;

  if (warehouseMatch) {
    heading = `Склад #${warehouseMatch.params.warehouseNumber}`;
  } else {
    heading = locationToHeadingMap.get(location.pathname);
  }

  const handleExportJson = () => {
    if (!warehouse) return;

    const cleanedWarehouse = {
      number: warehouse.number,
      address: warehouse.address,
      location: warehouse.location,
      rooms: warehouse.rooms,
      loadingDocks: warehouse.loadingDocks,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      employees: warehouse.employees.map(({ id, ...rest }) => {
        return rest;
      }),
    };

    const blob = new Blob([JSON.stringify(cleanedWarehouse, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `warehouse-${warehouse.number}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles["last-commit"]}>
        <h2>{heading || "Dashboard"}</h2>

        {warehouseMatch && user.role === "Warehouse Manager" && (
          <RoundIconButton onClick={handleExportJson} Icon={DownloadIcon} />
        )}
      </div>

      <div className={styles["bar-controls"]}>
        <div className={styles["user-summary"]}>
          <strong>{user.fullName}</strong>
          <span>{user.role}</span>
        </div>
        <RoundIconButton
          Icon={LogOutIcon}
          isRed={true}
          aria-label="Вийти із системи"
          title="Вийти"
          onClick={() => {
            localStorage.removeItem("user");
            dispatch(logout());
            navigate("/login");
          }}
        />
      </div>
    </div>
  );
}

const locationToHeadingMap: Map<string, string> = new Map([
  ["/", "Огляд"],
  ["/warehouses", "Склади"],
  ["/orders", "Замовлення"],
  ["/operations", "Операції"],
  ["/logistics", "Логістика"],
  ["/analysis", "Аналіз"],
  ["/logs", "Дії користувачів"],
]);
