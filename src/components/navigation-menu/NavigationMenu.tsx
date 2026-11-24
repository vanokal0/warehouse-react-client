import NavigationMenuItem, { MenuItem } from "./NavigationMenuItem";
import {
  ClipboardListIcon,
  CableIcon,
  HouseIcon,
  WarehouseIcon,
  TruckIcon,
  ChartColumnIcon,
  FileClockIcon,
} from "lucide-react";
import styles from "./NavigationMenu.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export default function NavigationMenu() {
  const user = useSelector((state: RootState) => state.auth);

  const MANAGER_MENU_ITEMS: MenuItem[] = [
    {
      id: "nav-1",
      label: "Склади",
      to: "/warehouses",
      Icon: WarehouseIcon,
    },
    {
      id: "nav-2",
      label: "Замовлення",
      to: "/orders",
      Icon: ClipboardListIcon,
    },
    { id: "nav-6", label: "Логування", to: "/logs", Icon: FileClockIcon },
  ];

  const LOGIST_MENU_ITEMS: MenuItem[] = [
    {
      id: "nav-1",
      label: "Склад",
      to: `/warehouse/${user.warehouseNumber}`,
      Icon: WarehouseIcon,
    },
    { id: "nav-4", label: "Логістика", to: "/logistics", Icon: TruckIcon },
    { id: "nav-6", label: "Логування", to: "/logs", Icon: FileClockIcon },
  ];

  const OPERATOR_MENU_ITEMS: MenuItem[] = [
    {
      id: "nav-1",
      label: "Склад",
      to: `/warehouse/${user.warehouseNumber}`,
      Icon: WarehouseIcon,
    },
    { id: "nav-3", label: "Операції", to: "/operations", Icon: CableIcon },
    { id: "nav-6", label: "Логування", to: "/logs", Icon: FileClockIcon },
  ];

  let items = DEFAULT_MENU_ITEMS;
  switch (user.role) {
    case "Warehouse Manager": {
      items = MANAGER_MENU_ITEMS;
      break;
    }
    case "Logistics Coordinator": {
      items = LOGIST_MENU_ITEMS;
      break;
    }
    case "Operator": {
      items = OPERATOR_MENU_ITEMS;
      break;
    }
  }

  return (
    <>
      <header className={styles.header}>
        <img src="/vite.svg" alt="" />
        <div>
          <h2>Warehouser</h2>
          <p>Система керування</p>
        </div>
      </header>
      <ul className={styles["menu-items-list"]}>
        {items.map((item) => (
          <li key={item.id}>
            <NavigationMenuItem item={item} />
          </li>
        ))}
      </ul>
    </>
  );
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: "nav-0", label: "Home", to: "/", Icon: HouseIcon },
  {
    id: "nav-1",
    label: "Склади",
    to: "/warehouses",
    Icon: WarehouseIcon,
  },
  { id: "nav-2", label: "Замовлення", to: "/orders", Icon: ClipboardListIcon },
  { id: "nav-3", label: "Операції", to: "/operations", Icon: CableIcon },
  { id: "nav-4", label: "Логістика", to: "/logistics", Icon: TruckIcon },
  { id: "nav-5", label: "Аналіз", to: "/analysis", Icon: ChartColumnIcon },
  { id: "nav-6", label: "Логування", to: "/logs", Icon: FileClockIcon },
];
