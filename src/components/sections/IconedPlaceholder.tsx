import { LucideIcon } from "lucide-react";
import styles from "./IconedPlaceholder.module.css";

type Props = {
  Icon: LucideIcon;
  textValue: string;
};

export default function IconedPlaceholder({ Icon, textValue }: Props) {
  return (
    <div className={styles["placeholder-container"]}>
      <Icon size={48} strokeWidth={1.5} />
      <p>{textValue}</p>
    </div>
  );
}
