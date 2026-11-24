import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import RequireAuth from "./RequireAuth";

function LoginProbe() {
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
  return <div>login page (from: {from ?? "none"})</div>;
}

const renderAt = (allowedRoles?: string[]) =>
  render(
    <MemoryRouter initialEntries={["/secret"]}>
      <Routes>
        <Route path="/" element={<div>home page</div>} />
        <Route path="/login" element={<LoginProbe />} />
        <Route
          path="/secret"
          element={
            <RequireAuth allowedRoles={allowedRoles}>
              <div>secret content</div>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>
  );

const storeUser = (user: object) => localStorage.setItem("user", JSON.stringify(user));

describe("RequireAuth", () => {
  it("redirects to login with origin when no user stored", () => {
    renderAt();
    expect(screen.getByText("login page (from: /secret)")).toBeInTheDocument();
  });

  it("redirects to login when stored user has no employeeId", () => {
    storeUser({ role: "Operator" });
    renderAt();
    expect(screen.getByText("login page (from: /secret)")).toBeInTheDocument();
  });

  it("renders children for an authenticated user without role restriction", () => {
    storeUser({ employeeId: 1, role: "Operator" });
    renderAt();
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });

  it("renders children when role is allowed", () => {
    storeUser({ employeeId: 1, role: "Warehouse Manager" });
    renderAt(["Warehouse Manager"]);
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });

  it("redirects home when role is not allowed", () => {
    storeUser({ employeeId: 1, role: "Operator" });
    renderAt(["Warehouse Manager"]);
    expect(screen.getByText("home page")).toBeInTheDocument();
  });

  it("redirects home when user has no role and roles are restricted", () => {
    storeUser({ employeeId: 1 });
    renderAt(["Operator"]);
    expect(screen.getByText("home page")).toBeInTheDocument();
  });
});
