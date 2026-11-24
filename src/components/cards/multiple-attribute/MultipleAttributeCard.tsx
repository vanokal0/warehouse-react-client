import IconedAttribute from "./IconedAttribute";
import { LucideIcon } from "lucide-react";
import styles from "./MultipleAttributeCard.module.css";
import ControlButtons, {
  ControlButtonsData,
} from "../../buttons/ControlButtons";

type Props = {
  title: string;
  mainAttribute: IconedAttributeData;
  sideAttributes: IconedAttributeData[];
  controls: ControlButtonsData[];
  themeColor?: string;
  attrThemeColor?: string;
};

export default function MultipleAttributeCard({
  title,
  mainAttribute,
  sideAttributes,
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
      <p className={styles["card-header"]}>{title}</p>
      <IconedAttribute
        themeColor={attrThemeColor}
        Icon={mainAttribute.Icon}
        value={mainAttribute.value}
        className={styles["card-subheader"]}
      />
      <div className={styles["attribute-container"]}>
        {sideAttributes.map((attribute, index) => (
          <IconedAttribute
            themeColor={attrThemeColor}
            key={`attr-${title}-${index}`}
            Icon={attribute.Icon}
            value={attribute.value}
          />
        ))}
      </div>
      {
        <div className={styles["button-section"]}>
          <ControlButtons controls={controls} />
        </div>
      }
    </div>
  );
}

export type IconedAttributeData = {
  Icon: LucideIcon;
  value: string;
};
