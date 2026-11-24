import { useEffect, useState } from "react";
import WarehouseRoomsChart, {
  WarehouseData,
} from "../../charts/WarehouseRoomChart";
import styles from "./AdministratorAnalysisPage.module.css";

export default function AdministratorAnalysisPage() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/warehouses`
        );
        const data = await response.json();
        setWarehouses(data);
      } catch (error) {
        console.error("Помилка при завантаженні складів:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  return (
    <div className={styles["page-container"]}>
      <section className={styles["chart-section"]}>
        {loading ? (
          <p>Завантаження...</p>
        ) : (
          <WarehouseRoomsChart warehouses={warehouses} />
        )}
      </section>
      <section className={styles["attribute-section"]}>
        <h3>Статистичні показники</h3>
      </section>
    </div>
  );
}
