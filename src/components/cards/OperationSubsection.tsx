import {
  BoxIcon,
  DoorOpenIcon,
  EllipsisIcon,
  TruckIcon,
  UserIcon,
} from "lucide-react";
import styles from "./OrderProductLogisticsCard.module.css";
import TextButton from "../buttons/TextButton";
import MultipleAttributeCard from "./multiple-attribute/MultipleAttributeCard";

type Operation = {
  number: string;
  quantity: number;
  employee: string;
  roomNumber: string;
  lotNumber: string;
};

type Props<T extends Operation> = {
  title: string;
  operations: T[];
  canAdd: boolean;
  onAdd: () => void;
  onOpen: (operation: T) => void;
};

export default function OperationSubsection<T extends Operation>({
  title,
  operations,
  canAdd,
  onAdd,
  onOpen,
}: Props<T>) {
  return (
    <div className={styles["subsection"]}>
      <div className={styles["subsection-header"]}>
        <h4>{title}</h4>
        {canAdd && <TextButton onClick={onAdd} textValue="+ Додати" />}
      </div>
      <div className={styles["list-container"]}>
        <ul>
          {operations.map((operation) => (
            <MultipleAttributeCard
              key={operation.number}
              title={operation.number}
              mainAttribute={{
                Icon: BoxIcon,
                value: `${operation.quantity} шт.`,
              }}
              sideAttributes={[
                { Icon: UserIcon, value: operation.employee },
                { Icon: DoorOpenIcon, value: operation.roomNumber },
                { Icon: TruckIcon, value: operation.lotNumber },
              ]}
              controls={[{ Icon: EllipsisIcon, onClick: () => onOpen(operation) }]}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
