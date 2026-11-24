import { ControlButtonsData } from "./ControlButtons";
import styles from "./RoundButton.module.css";

export default function RoundIconButton({
  Icon,
  isRed,
  ...props
}: ControlButtonsData) {
  return (
    <button
      className={`${styles["control-button"]} ${
        isRed ? styles["primary-red"] : ""
      }`}
      {...props}
    >
      <Icon />
    </button>
  );
}
