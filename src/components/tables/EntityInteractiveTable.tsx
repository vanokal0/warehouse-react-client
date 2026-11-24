import {
  DataGrid,
  getGridDateOperators,
  getGridNumericOperators,
  getGridStringOperators,
  GridColDef,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";
import { ukUA } from "@mui/x-data-grid/locales";
import { useEffect, useState } from "react";
import styles from "./EntityInteractiveTable.module.css";
import { betweenDateOperator } from "../../utils/getCustomDateOperator";
import { CustomModernToolbar } from "./CustomToolbar";
import { OrderProductData } from "../../typing";
import {
  generatePdfFromBookings,
  generatePdfFromOrders,
} from "../../utils/generatePdfFromRows";

type QueryModel = {
  page: number;
  pageSize: number;
  filters: { field: string; operator: string; value: string }[];
  sorts: { field: string; order: "asc" | "desc" }[];
};

type EntityTableProps<T> = {
  title: string;
  dataUrl: string;
  columns: GridColDef[];
  pageSize?: number;
  idAccessor: (item: T) => string | number;
  renderHeaderButtons?: () => React.ReactNode;
};

export default function EntityInteractiveTable<T>({
  title,
  dataUrl,
  columns,
  pageSize = 7,
  idAccessor,
  renderHeaderButtons,
}: EntityTableProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [queryModel, setQueryModel] = useState<QueryModel>({
    page: 0,
    pageSize,
    filters: [],
    sorts: [],
  });

  const handlePaginationChange = (model: GridPaginationModel) => {
    setQueryModel((prev) => ({
      ...prev,
      page: model.page,
      pageSize: model.pageSize,
    }));
  };

  const handleFilterChange = (model: GridFilterModel) => {
    const filters = model.items
      .filter((f) => f.value && f.operator)
      .map((f) => ({
        field: f.field,
        operator: f.operator || "contains", // fallback
        value: f.value?.toString() || "",
      }));

    setQueryModel((prev) => ({
      ...prev,
      page: 0,
      filters,
    }));
  };

  const handleSortChange = (model: GridSortModel) => {
    const sorts = model.map((s) => ({
      field: s.field,
      order: s.sort as "asc" | "desc",
    }));

    setQueryModel((prev) => ({
      ...prev,
      sorts,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const params = new URLSearchParams({
        page: queryModel.page.toString(),
        pageSize: queryModel.pageSize.toString(),
      });

      queryModel.filters.forEach(({ field, operator, value }) => {
        params.append("filterField", field);
        params.append("filterOperator", operator);
        params.append("filterValue", value);
      });

      queryModel.sorts.forEach(({ field, order }) => {
        params.append("sortField", field);
        params.append("sortOrder", order);
      });

      try {
        const response = await fetch(`${dataUrl}?${params}`);
        const data = await response.json();

        if (!data.items) throw new Error("Invalid response format");

        const rowsWithId = data.items.map((item: T) => ({
          ...item,
          id: idAccessor(item),
        }));

        setRows(rowsWithId);
        setRowCount(data.total);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [queryModel, dataUrl, idAccessor]);

  const buildExportQuery = () => {
    const params = new URLSearchParams();
    params.append("all", "true");

    queryModel.sorts.forEach(({ field, order }) => {
      params.append("sortField", field);
      params.append("sortOrder", order);
    });

    queryModel.filters.forEach(({ field, operator, value }) => {
      params.append("filterField", field);
      params.append("filterOperator", operator);
      params.append("filterValue", value);
    });

    return params;
  };

  const handleExportAllToCsv = async () => {
    const params = buildExportQuery();
    const response = await fetch(`${dataUrl}?${params}`);
    const data = await response.json();

    const csvContent = generateCsvFromRows(data.items);
    downloadFile(
      csvContent,
      title.includes("Бронювання") ? "lot_bookings.csv" : "orders.csv",
      "text/csv"
    );
  };

  const handleExportAllToPdf = async () => {
    const params = new URLSearchParams();
    params.append("all", "true");

    queryModel.sorts.forEach(({ field, order }) => {
      params.append("sortField", field);
      params.append("sortOrder", order);
    });

    queryModel.filters.forEach(({ field, operator, value }) => {
      params.append("filterField", field);
      params.append("filterOperator", operator);
      params.append("filterValue", value);
    });

    const response = await fetch(`${dataUrl}?${params}`);
    const data = await response.json();

    if (data.items?.length) {
      if (title.includes("Бронювання")) {
        generatePdfFromBookings(data.items);
      } else {
        generatePdfFromOrders(data.items);
      }
    }
  };

  return (
    <div className={styles["table-container"]}>
      <div className={styles["container-header"]}>
        <h3>{title}</h3>
        <div className={styles["button-container"]}>
          {renderHeaderButtons?.()}
        </div>
      </div>

      <DataGrid
        rows={rows}
        columns={sanitizeColumns(columns)}
        paginationMode="server"
        paginationModel={{
          page: queryModel.page,
          pageSize: queryModel.pageSize,
        }}
        pageSizeOptions={[queryModel.pageSize]}
        rowCount={rowCount}
        onPaginationModelChange={handlePaginationChange}
        filterMode="server"
        onFilterModelChange={handleFilterChange}
        sortingMode="server"
        onSortModelChange={handleSortChange}
        loading={loading}
        rowSelection={false}
        slots={{
          toolbar: () => (
            <CustomModernToolbar
              onExportCsv={handleExportAllToCsv}
              onExportPDF={handleExportAllToPdf}
            />
          ),
        }}
        showToolbar
        slotProps={{
          toolbar: {
            showQuickFilter: false,
          },
        }}
        localeText={ukUA.components.MuiDataGrid.defaultProps.localeText}
        getRowClassName={(params) => {
          switch (params.row.orderStatus) {
            case "CREATED":
              return styles.rowCreated;
            case "STORED":
              return styles.rowStored;
            case "SHIPPED":
              return styles.rowShipped;
            default:
              return "";
          }
        }}
      />
    </div>
  );
}

function sanitizeColumns(columns: GridColDef[]): GridColDef[] {
  return columns.map((col) => {
    const newCol = { ...col };

    if (col.type === "string") {
      newCol.filterOperators = getGridStringOperators().filter(
        (op) => op.value !== "isEmpty" && op.value !== "isNotEmpty"
      );
    }

    if (col.type === "number") {
      newCol.filterOperators = getGridNumericOperators().filter(
        (op) => op.value !== "isEmpty" && op.value !== "isNotEmpty"
      );
    }

    if (col.type === "date" || col.type === "dateTime") {
      const baseOps = getGridDateOperators().filter(
        (op) => op.value !== "isEmpty" && op.value !== "isNotEmpty"
      );
      newCol.filterOperators = [...baseOps, betweenDateOperator];
    }

    return newCol;
  });
}

function generateCsvFromRows<T extends Record<string, unknown>>(
  rows: T[]
): string {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((key) => {
          const value = row[key];

          if (Array.isArray(value)) {
            return `"${value
              .map((item) =>
                typeof item === "object" ? serializeProduct(item) : String(item)
              )
              .join(" | ")}"`;
          }

          if (value instanceof Date) {
            return `"${value.toISOString()}"`;
          }

          return `"${String(value ?? "")}"`;
        })
        .join(",")
    ),
  ];

  return csv.join("\n");
}

function serializeProduct(product: OrderProductData): string {
  if (!product) return "";
  return `${product.concreteProduct.concreteProductName} - ${product.quantity}`;
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
