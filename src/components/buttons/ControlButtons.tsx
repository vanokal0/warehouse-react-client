import RoundIconButton from "./RoundIconButton";
import styles from "./ControlButtons.module.css";
import { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

type Props = {
  controls: ControlButtonsData[];
};

export default function ControlButtons({ controls }: Props) {
  return (
    <div className={styles["button-container"]}>
      {controls.map((control, index) => {
        return <RoundIconButton key={`control-${index}`} {...control} />;
      })}
    </div>
  );
}

export type ControlButtonsData = {
  isRed?: boolean;
  Icon: LucideIcon;
} & ButtonHTMLAttributes<HTMLButtonElement>;
