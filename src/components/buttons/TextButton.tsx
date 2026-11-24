import { ButtonHTMLAttributes } from "react";
import styles from "./TextButton.module.css";

type Props = {
  textValue: string;
  isSmall?: boolean;
  isSecondary?: boolean;
  theme?: "green" | "red" | "blue";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function TextButton({
  textValue,
  isSmall = false,
  isSecondary = false,
  theme = "blue",
  ...props
}: Props) {
  return (
    <button
      className={`${styles["text-button"]} ${isSmall ? styles["small"] : ""} ${
        isSecondary ? styles["secondary"] : ""
      } ${theme ? styles[theme] : ""}`}
      {...props}
    >
      {textValue}
    </button>
  );
}
