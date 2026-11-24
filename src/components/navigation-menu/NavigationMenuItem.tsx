import { FC } from "react";
import { NavLink } from "react-router";
import styles from "./NavigationMenuItem.module.css";
import { LucideIcon } from "lucide-react";

const NavigationMenuItem: FC<Props> = ({ item }) => {
  return (
    <NavLink
      to={item.to}
      className={({ isActive, isPending }) =>
        isActive
          ? `${styles["item-container"]} ${styles["active"]}`
          : isPending
          ? `${styles["item-container"]} ${styles["pending"]}`
          : styles["item-container"]
      }
    >
      <div className={styles["active-indicator"]} />
      <div className={styles["item-data"]}>
        <item.Icon className={styles["item-icon"]} />
        <p>{item.label}</p>
      </div>
    </NavLink>
  );
};

export type MenuItem = {
  id: string;
  label: string;
  to: string;
  Icon: LucideIcon;
};
type Props = { item: MenuItem };

export default NavigationMenuItem;
