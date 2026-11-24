import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Line } from "react-chartjs-2";
import styles from "./WarehouseRoomChart.module.css";

export type EmployeeData = unknown;
export type RoomData = unknown;
export type LoadingDockData = unknown;
export type Location = unknown;

export type WarehouseData = {
  id: string;
  number: string;
  address: string;
  employees: EmployeeData[];
  rooms: RoomData[];
  loadingDocks: LoadingDockData[];
  location: Location;
};

type Props = {
  warehouses: WarehouseData[];
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

const WarehouseRoomsChart: React.FC<Props> = ({ warehouses }) => {
  const distributionMap: Record<number, number> = {};

  warehouses.forEach((warehouse) => {
    const roomCount = warehouse.rooms.length;
    distributionMap[roomCount] = (distributionMap[roomCount] || 0) + 1;
  });

  const sortedEntries = Object.entries(distributionMap).sort(
    (a, b) => Number(a[0]) - Number(b[0])
  );

  const labels = sortedEntries.map(([roomCount]) => roomCount);
  const dataValues = sortedEntries.map(([, count]) => count);

  const data = {
    labels,
    datasets: [
      {
        label: "Кількість складів",
        data: dataValues,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Розподіл складів за кількістю кімнат",
        font: { size: 18 },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Кількість кімнат",
        },
      },
      y: {
        min: 1,
        max: 8,
        title: {
          display: true,
          text: "Кількість складів",
        },
        ticks: {
          stepSize: 1,
          precision: 0,
        },
      },
    },
  };

  return (
    <div className={styles["chart-container"]}>
      <Line data={data} options={options} />
    </div>
  );
};

export default WarehouseRoomsChart;
