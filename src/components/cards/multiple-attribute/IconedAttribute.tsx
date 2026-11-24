import { LucideIcon } from "lucide-react";
import { FC, HTMLAttributes } from "react";
import styles from "./IconedAttribute.module.css";

const IconedAttribute: FC<Props> = ({ Icon, value, themeColor, ...props }) => {
  return (
    <div className={`${styles["container"]} ${props.className}`}>
      <Icon color={themeColor} />
      <p>{value}</p>
    </div>
  );
};

export default IconedAttribute;

type Props = {
  Icon: LucideIcon;
  value: string;
  themeColor?: string;
} & HTMLAttributes<HTMLDivElement>;
