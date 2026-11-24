import { LucideIcon } from "lucide-react";
import { FC } from "react";
import styles from "./IconInfoCard.module.css";

const IconInfoCard: FC<Props> = ({ title, value, Icon, color }) => {
  return (
    <div className={styles["container"]}>
      <div
        className={styles["icon-container"]}
        style={{ backgroundColor: `${color}4D` }}
      >
        <Icon className={styles["icon"]} color={color} />
      </div>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
};

type Props = {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  color: string;
};

export default IconInfoCard;
