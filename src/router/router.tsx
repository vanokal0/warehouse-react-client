import { createBrowserRouter } from "react-router";
import RootLayout from "./RootLayout";
import AdministratorHomePage from "../components/home-pages/AdministratorHomePage";
import ErrorPage from "./ErrorPage";
import MultipleWarehousePage, {
  multipleWarehouseLoader,
} from "../components/data-pages/multiple-data/MultipleWarehousePage";
import { singleWarehouseLoader } from "../components/data-pages/single-data/SingleWarehousePage";
import SingleWarehousePage from "../components/data-pages/single-data/SingleWarehousePage";
import WarehouseRootLayout from "./WarehouseRootLayout";
import MultipleOrderPage from "../components/data-pages/multiple-data/MultipleOrderPage";
import MultipleOperationPage from "../components/data-pages/multiple-data/MultipleOperationPage";
import AdministratorAnalysisPage from "../components/data-pages/statistics-data/AdministratorAnalysisPage";
import ActionsLogPage from "../components/data-pages/actions-data/ActionsLogPage";
import MultipleLogisticsPage from "../components/data-pages/multiple-data/MultipleLogisticsPage";
import LoginPage from "../components/auth/LoginPage";
import RequireAuth from "../components/auth/RequireAuth";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <RequireAuth>
            <AdministratorHomePage />
          </RequireAuth>
        ),
      },
      {
        path: "warehouses",
        element: (
          <RequireAuth allowedRoles={["Warehouse Manager"]}>
            <WarehouseRootLayout />
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <MultipleWarehousePage />,
            loader: multipleWarehouseLoader,
          },
        ],
      },
      {
        path: "warehouse/:warehouseNumber", // ❗ перенесено сюди
        element: (
          <RequireAuth>
            <SingleWarehousePage />
          </RequireAuth>
        ),
        loader: singleWarehouseLoader,
      },
      {
        path: "orders",
        element: (
          <RequireAuth allowedRoles={["Warehouse Manager"]}>
            <MultipleOrderPage />
          </RequireAuth>
        ),
      },
      {
        path: "operations",
        element: (
          <RequireAuth allowedRoles={["Operator"]}>
            <MultipleOperationPage />
          </RequireAuth>
        ),
      },
      {
        path: "logistics",
        element: (
          <RequireAuth allowedRoles={["Logistics Coordinator"]}>
            <MultipleLogisticsPage />
          </RequireAuth>
        ),
      },
      {
        path: "analysis",
        element: (
          <RequireAuth allowedRoles={["Warehouse Manager"]}>
            <AdministratorAnalysisPage />
          </RequireAuth>
        ),
      },
      {
        path: "logs",
        element: (
          <RequireAuth>
            <ActionsLogPage />
          </RequireAuth>
        ),
      },
    ],
  },
]);

export default router;
