import { useEffect, useState } from "react";
import { ActionLogData } from "../../../typing";
import styles from "./ActionsLogPage.module.css";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import TextButton from "../../buttons/TextButton";
import PaginatedSearchableList from "../../lists/PaginatedSearchableList";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

const operationColorMap: Record<string, string> = {
  CREATE: "#4CAF50",
  UPDATE: "#FFC107",
  DELETE: "#F44336",
  CANCELLED: "#9E9E9E",
};

export default function ActionsLogPage() {
  const [logs, setLogs] = useState<ActionLogData[]>([]);
  const [myLogs, setMyLogs] = useState<ActionLogData[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const user = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_API_URL}/action-logs`)
      .then((res) => res.json())
      .then(setLogs);

    if (user.employeeId) {
      fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/action-logs/by-user/${
          user.employeeId
        }`
      )
        .then((res) => res.json())
        .then(setMyLogs);
    }
  }, [user.employeeId]);

  const handleUndo = async (id: string) => {
    await fetch(
      `${import.meta.env.VITE_BACKEND_API_URL}/action-logs/cancel/${id}`,
      {
        method: "POST",
      }
    );

    const updateLogs = (logs: ActionLogData[]) =>
      logs.map((log) => (log.id === id ? { ...log, cancelled: true } : log));

    setLogs(updateLogs);
    setMyLogs(updateLogs);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderMapDiff = (label: string, map: Map<string, string>) => (
    <>
      <h5>{label}</h5>
      <ul>
        {Array.from(Object.entries(map)).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {value}
          </li>
        ))}
      </ul>
    </>
  );

  const renderLogCard = (log: ActionLogData) => {
    const isExpanded = expandedIds.has(log.id);
    const isUpdate = log.operationType === "UPDATE";
    const color = log.cancelled
      ? operationColorMap["CANCELLED"]
      : operationColorMap[log.operationType];

    return (
      <div key={log.id} className={styles["log-card"]}>
        <div
          className={styles["left-bar"]}
          style={{ backgroundColor: color }}
        />
        <div className={styles["log-content"]}>
          <div className={styles["card-header"]}>
            <div>
              <h4>
                {log.operationType} {log.entityType} — {log.entityName}
              </h4>
              <p>{new Date(log.timestamp).toLocaleString()}</p>
              <p className={styles["muted"]}>{log.initiatorFullName}</p>
            </div>
            {isUpdate && (
              <button
                className={styles["toggle-button"]}
                onClick={() => toggleExpanded(log.id)}
              >
                {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            )}
          </div>

          {isUpdate && isExpanded && (
            <div className={styles["diff-section"]}>
              {renderMapDiff("До:", log.prevAttributes)}
              {renderMapDiff("Після:", log.newAttributes)}
            </div>
          )}

          {!log.cancelled && user.role === "Warehouse Manager" && (
            <div className={styles["undo-button"]}>
              <TextButton
                textValue="Відмінити"
                onClick={() => handleUndo(log.id)}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles["page-container"]}>
      <section className={styles["my-log-section"]}>
        <PaginatedSearchableList
          getKey={(log) => log.id}
          title="Мої логи"
          data={myLogs}
          renderItem={renderLogCard}
          layout="list"
        />
      </section>

      {user.role === "Warehouse Manager" && (
        <section className={styles["global-log-section"]}>
          <PaginatedSearchableList
            getKey={(log) => log.id}
            title="Логи користувачів"
            data={logs}
            renderItem={renderLogCard}
            layout="list"
          />
        </section>
      )}
    </div>
  );
}
