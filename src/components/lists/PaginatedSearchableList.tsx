import { useMemo, useState, ReactNode } from "react";
import styles from "./PaginatedSearchableList.module.css";
import TextButton from "../buttons/TextButton";
import { ArrowDownAZIcon, ArrowUpAZIcon, Settings2Icon } from "lucide-react"; // або будь-яка інша іконка

type Props<T> = {
  data: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  title?: string;
  layout?: "list" | "grid";
  columnsAmount?: number;
  itemsPerPage?: number;
  onAddNew?: () => void;
  themeColor?: "green" | "red" | "blue";
  hcolor?: string;
};

function PaginatedSearchableList<T extends object>({
  data,
  renderItem,
  getKey,
  title = "Items",
  layout = "list",
  columnsAmount,
  itemsPerPage,
  onAddNew,
  themeColor = "blue",
  hcolor = "#343c6a",
}: Props<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortableKeys = useMemo(() => {
    const keys = new Set<string>();
    data.forEach((item) => {
      Object.entries(item).forEach(([key, value]) => {
        if (
          typeof value !== "object" &&
          typeof value !== "function" &&
          value !== null &&
          !key.toLowerCase().includes("id")
        ) {
          keys.add(key);
        }
      });
    });
    return Array.from(keys);
  }, [data]);

  const filteredData = data.filter((item) => {
    const entries = Object.entries(item).filter(
      ([, value]) =>
        typeof value !== "object" &&
        typeof value !== "function" &&
        value !== null
    );

    if (filterField) {
      const fieldEntry = entries.find(([key]) => key === filterField);
      const value = fieldEntry?.[1];
      return String(value ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    }

    return entries.some(([, value]) =>
      String(value ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = Object.entries(a).find(([key]) => key === sortField)?.[1];
    const bVal = Object.entries(b).find(([key]) => key === sortField)?.[1];
    const aStr = String(aVal ?? "").toLowerCase();
    const bStr = String(bVal ?? "").toLowerCase();

    if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
    if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = itemsPerPage
    ? Math.ceil(sortedData.length / itemsPerPage)
    : 1;

  const currentItems = itemsPerPage
    ? sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : sortedData;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={styles["list-container"]}>
      <div className={styles["list-header"]}>
        <h3 style={{ color: hcolor }}>{title}</h3>
        {onAddNew && (
          <TextButton
            onClick={onAddNew}
            textValue="+ Додати"
            theme={themeColor}
          />
        )}
      </div>

      <div className={styles["filter-controls"]}>
        <input
          aria-label={`Пошук у списку «${title}»`}
          type="text"
          placeholder="Пошук..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className={styles["search-input"]}
        />

        <select
          aria-label="Поле пошуку"
          value={filterField}
          onChange={(e) => {
            setFilterField(e.target.value);
            setCurrentPage(1);
          }}
          className={styles["select-input"]}
        >
          <option value="">Усі</option>
          {sortableKeys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        <div className={styles["sort-container"]}>
          <button
            onClick={() => setShowSortMenu((prev) => !prev)}
            className={styles["sort-toggle-button"]}
            title="Сортувати за полем"
          >
            <Settings2Icon size={18} />
          </button>

          {showSortMenu && (
            <div className={styles["sort-menu"]}>
              {sortableKeys.map((key) => (
                <button
                  key={key}
                  className={`${styles["sort-option"]} ${
                    sortField === key ? styles["active"] : ""
                  }`}
                  onClick={() => {
                    setSortField(key);
                    setShowSortMenu(false);
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          aria-label={
            sortDirection === "asc"
              ? "Сортувати за спаданням"
              : "Сортувати за зростанням"
          }
          onClick={() =>
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          className={styles["toggle-sort-button"]}
        >
          {sortDirection === "asc" ? (
            <ArrowUpAZIcon size={18} />
          ) : (
            <ArrowDownAZIcon size={18} />
          )}
        </button>
      </div>

      {currentItems.length === 0 ? (
        <p>Нічого не знайдено</p>
      ) : (
        <ul
          className={`${
            layout === "grid" ? styles["grid-layout"] : styles["list-layout"]
          } ${!itemsPerPage ? styles["scrollable"] : ""}`}
          style={
            layout === "grid" && columnsAmount
              ? { gridTemplateColumns: `repeat(${columnsAmount}, 1fr)` }
              : {}
          }
        >
          {currentItems.map((item) => (
            <li key={getKey(item)}>{renderItem(item)}</li>
          ))}
        </ul>
      )}

      {itemsPerPage && sortedData.length > itemsPerPage && (
        <div className={styles["pagination-controls"]}>
          <TextButton
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            isSmall
            textValue="<"
            theme={themeColor}
          />
          <span>
            {currentPage} / {totalPages}
          </span>
          <TextButton
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            isSmall
            textValue=">"
            theme={themeColor}
          />
        </div>
      )}
    </div>
  );
}

export default PaginatedSearchableList;
