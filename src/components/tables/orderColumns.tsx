import { GridColDef } from "@mui/x-data-grid";
import { OrderData, OrderProductData } from "../../typing";
import TextButton from "../buttons/TextButton";
import ProductsCountCell from "./ProductsCountCell";

type OrderColumnsOptions = {
  onDetails: (order: OrderData) => void;
  supplierFlex?: number;
  // Page-specific columns inserted before the "actions" column.
  extraColumns?: GridColDef<OrderData>[];
};

export function getOrderColumns({
  onDetails,
  supplierFlex = 1.5,
  extraColumns = [],
}: OrderColumnsOptions): GridColDef<OrderData>[] {
  return [
    { field: "number", headerName: "Номер", flex: 1, type: "string" },
    {
      field: "orderDateTime",
      headerName: "Дата",
      flex: 1,
      valueGetter: (value: string) => new Date(value),
      type: "date",
      headerAlign: "center",
      align: "center",
    },
    {
      field: "supplier",
      headerName: "Постачальник",
      flex: supplierFlex,
      type: "string",
    },
    { field: "orderStatus", headerName: "Статус", flex: 1, type: "string" },
    {
      field: "products",
      headerName: "Продукти",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ProductsCountCell products={params.value as OrderProductData[]} />
      ),
    },
    ...extraColumns,
    {
      field: "actions",
      headerName: "Дії",
      sortable: false,
      filterable: false,
      minWidth: 82,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <TextButton
          isSmall
          textValue="Деталі"
          onClick={() => onDetails(params.row)}
        />
      ),
    },
  ];
}
