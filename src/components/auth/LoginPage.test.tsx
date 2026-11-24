import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./LoginPage";

const fetchMock = vi.fn();

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/warehouses" element={<div>warehouses list</div>} />
        <Route path="/warehouse/:number" element={<div>single warehouse</div>} />
      </Routes>
    </MemoryRouter>
  );

const fillAndSubmit = async (username = "user", password = "pass") => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Логін"), username);
  await user.type(screen.getByLabelText("Пароль"), password);
  await user.click(screen.getByRole("button", { name: "Увійти" }));
};

const okResponse = (data: object) => ({ ok: true, json: async () => data, text: async () => "" });

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe("LoginPage", () => {
  it("renders the form", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: "Вхід у систему" })).toBeInTheDocument();
    expect(screen.getByLabelText("Логін")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Пароль")).toHaveAttribute("type", "password");
  });

  it("shows validation errors and does not call API for empty fields", async () => {
    renderLogin();
    await userEvent.setup().click(screen.getByRole("button", { name: "Увійти" }));
    expect(await screen.findAllByText("Обов'язково")).toHaveLength(2);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts credentials to the login endpoint", async () => {
    fetchMock.mockResolvedValue(okResponse({ employeeId: 1, role: "Operator", warehouseNumber: "W1", fullName: "J" }));
    renderLogin();
    await fillAndSubmit("alice", "secret");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(`${import.meta.env.VITE_BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "alice", password: "secret" }),
    });
  });

  it("stores user and navigates managers to warehouses list", async () => {
    const data = { employeeId: 1, role: "Warehouse Manager", warehouseNumber: "W1", fullName: "Boss" };
    fetchMock.mockResolvedValue(okResponse({ ...data, extra: "ignored" }));
    renderLogin();
    await fillAndSubmit();
    expect(await screen.findByText("warehouses list")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("user")!)).toEqual(data);
  });

  it("navigates other roles to their warehouse", async () => {
    fetchMock.mockResolvedValue(okResponse({ employeeId: 2, role: "Operator", warehouseNumber: "W5", fullName: "Op" }));
    renderLogin();
    await fillAndSubmit();
    expect(await screen.findByText("single warehouse")).toBeInTheDocument();
  });

  it("stays on login page when non-manager has no warehouse", async () => {
    fetchMock.mockResolvedValue(okResponse({ employeeId: 2, role: "Operator", warehouseNumber: null, fullName: "Op" }));
    renderLogin();
    await fillAndSubmit();
    await waitFor(() => expect(localStorage.getItem("user")).not.toBeNull());
    expect(screen.getByRole("button", { name: "Увійти" })).toBeEnabled();
    expect(screen.queryByText("single warehouse")).not.toBeInTheDocument();
  });

  it("shows server error message and re-enables submit", async () => {
    fetchMock.mockResolvedValue({ ok: false, text: async () => "Invalid credentials" });
    renderLogin();
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials");
    expect(screen.getByRole("button", { name: "Увійти" })).toBeEnabled();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("shows network error message", async () => {
    fetchMock.mockRejectedValue(new Error("Network down"));
    renderLogin();
    await fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveTextContent("Network down");
  });
});
