import styles from "./SingleAttributeCard.module.css";
import ControlButtons, {
  ControlButtonsData,
} from "../../buttons/ControlButtons";
import IconedAttribute from "../multiple-attribute/IconedAttribute";
import { IconedAttributeData } from "../multiple-attribute/MultipleAttributeCard";

export default function SingleAttributeCard({
  title,
  attribute,
  controls,
  themeColor = "#718ebf",
  attrThemeColor = "#343c6a",
}: Props) {
  return (
    <div className={styles["card-container"]}>
      <div
        className={styles["colored-figure"]}
        style={{ backgroundColor: themeColor }}
      />
      <h3>{title}</h3>
      <IconedAttribute
        Icon={attribute.Icon}
        value={attribute.value}
        themeColor={attrThemeColor}
      />
      <div className={styles["button-section"]}>
        <ControlButtons controls={controls} />
      </div>
    </div>
  );
}

type Props = {
  title: string;
  attribute: IconedAttributeData;
  controls: ControlButtonsData[];
  themeColor?: string;
  attrThemeColor?: string;
};
