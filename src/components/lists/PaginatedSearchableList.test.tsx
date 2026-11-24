import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaginatedSearchableList from "./PaginatedSearchableList";

type Item = {
  id: number;
  name: string;
  city: string;
  stock: number;
  meta: { nested: boolean };
  note: string | null;
};

const items: Item[] = [
  { id: 1, name: "Charlie", city: "Kyiv", stock: 5, meta: { nested: true }, note: null },
  { id: 2, name: "alpha", city: "Lviv", stock: 10, meta: { nested: false }, note: "x" },
  { id: 3, name: "Bravo", city: "Kyiv", stock: 1, meta: { nested: true }, note: null },
];

const renderList = (props: Partial<Parameters<typeof PaginatedSearchableList<Item>>[0]> = {}) =>
  render(
    <PaginatedSearchableList<Item>
      data={items}
      getKey={(i) => String(i.id)}
      renderItem={(i) => <span>{i.name}</span>}
      {...props}
    />
  );

const names = () => screen.queryAllByRole("listitem").map((li) => li.textContent);

describe("PaginatedSearchableList", () => {
  it("renders title, all items and default heading color", () => {
    renderList();
    const heading = screen.getByRole("heading", { name: "Items" });
    expect(heading).toHaveStyle({ color: "#343c6a" });
    expect(names()).toEqual(["Charlie", "alpha", "Bravo"]);
    expect(screen.getByRole("list")).toHaveClass("list-layout", "scrollable");
  });

  it("shows add button only when handler provided", async () => {
    const onAddNew = vi.fn();
    const { unmount } = renderList();
    expect(screen.queryByRole("button", { name: "+ Додати" })).not.toBeInTheDocument();
    unmount();

    renderList({ onAddNew, themeColor: "green", title: "Rooms", hcolor: "red" });
    expect(screen.getByRole("heading", { name: "Rooms" })).toHaveStyle({ color: "rgb(255, 0, 0)" });
    const add = screen.getByRole("button", { name: "+ Додати" });
    expect(add).toHaveClass("green");
    await userEvent.setup().click(add);
    expect(onAddNew).toHaveBeenCalledTimes(1);
  });

  it("offers only primitive, non-id fields for filtering", () => {
    renderList();
    const options = within(screen.getByLabelText("Поле пошуку"))
      .getAllByRole("option")
      .map((o) => o.textContent);
    expect(options).toEqual(["Усі", "name", "city", "stock", "note"]);
  });

  it("searches case-insensitively across all primitive fields", async () => {
    renderList();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Пошук у списку «Items»"), "KYIV");
    expect(names()).toEqual(["Charlie", "Bravo"]);
  });

  it("does not match object fields", async () => {
    renderList();
    await userEvent.setup().type(screen.getByLabelText("Пошук у списку «Items»"), "nested");
    expect(names()).toEqual([]);
    expect(screen.getByText("Нічого не знайдено")).toBeInTheDocument();
  });

  it("restricts search to the selected field", async () => {
    renderList();
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Поле пошуку"), "stock");
    await user.type(screen.getByLabelText("Пошук у списку «Items»"), "1");
    expect(names()).toEqual(["alpha", "Bravo"]);
  });

  it("treats missing/null field values as empty when filtering by field", async () => {
    renderList();
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Поле пошуку"), "note");
    expect(names()).toEqual(["Charlie", "alpha", "Bravo"]);
    await user.type(screen.getByLabelText("Пошук у списку «Items»"), "x");
    expect(names()).toEqual(["alpha"]);
  });

  it("sorts by chosen field and toggles direction", async () => {
    renderList();
    const user = userEvent.setup();

    await user.click(screen.getByTitle("Сортувати за полем"));
    const sortMenuButton = screen.getByRole("button", { name: "name" });
    await user.click(sortMenuButton);
    expect(screen.queryByRole("button", { name: "city" })).not.toBeInTheDocument();
    expect(names()).toEqual(["alpha", "Bravo", "Charlie"]);

    await user.click(screen.getByRole("button", { name: "Сортувати за спаданням" }));
    expect(names()).toEqual(["Charlie", "Bravo", "alpha"]);
    expect(screen.getByRole("button", { name: "Сортувати за зростанням" })).toBeInTheDocument();

    await user.click(screen.getByTitle("Сортувати за полем"));
    expect(screen.getByRole("button", { name: "name" })).toHaveClass("sort-option", "active");
    expect(screen.getByRole("button", { name: "city" })).not.toHaveClass("active");
  });

  it("keeps original order for equal sort keys", async () => {
    renderList();
    const user = userEvent.setup();
    await user.click(screen.getByTitle("Сортувати за полем"));
    await user.click(screen.getByRole("button", { name: "city" }));
    expect(names()).toEqual(["Charlie", "Bravo", "alpha"]);
  });

  it("toggles sort menu visibility", async () => {
    renderList();
    const user = userEvent.setup();
    const toggle = screen.getByTitle("Сортувати за полем");
    await user.click(toggle);
    expect(screen.getByRole("button", { name: "stock" })).toBeInTheDocument();
    await user.click(toggle);
    expect(screen.queryByRole("button", { name: "stock" })).not.toBeInTheDocument();
  });

  describe("pagination", () => {
    it("paginates and navigates between pages", async () => {
      renderList({ itemsPerPage: 2 });
      const user = userEvent.setup();
      const prev = screen.getByRole("button", { name: "<" });
      const next = screen.getByRole("button", { name: ">" });

      expect(screen.getByRole("list")).not.toHaveClass("scrollable");
      expect(names()).toEqual(["Charlie", "alpha"]);
      expect(screen.getByText("1 / 2")).toBeInTheDocument();
      expect(prev).toBeDisabled();

      await user.click(next);
      expect(names()).toEqual(["Bravo"]);
      expect(screen.getByText("2 / 2")).toBeInTheDocument();
      expect(next).toBeDisabled();

      await user.click(prev);
      expect(screen.getByText("1 / 2")).toBeInTheDocument();
    });

    it("hides controls when everything fits on one page", () => {
      renderList({ itemsPerPage: 3 });
      expect(screen.queryByRole("button", { name: ">" })).not.toBeInTheDocument();
    });

    it("resets to first page on search and filter-field change", async () => {
      renderList({ itemsPerPage: 1 });
      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: ">" }));
      await user.click(screen.getByRole("button", { name: ">" }));
      expect(screen.getByText("3 / 3")).toBeInTheDocument();

      await user.type(screen.getByLabelText("Пошук у списку «Items»"), "kyiv");
      expect(screen.getByText("1 / 2")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: ">" }));
      expect(screen.getByText("2 / 2")).toBeInTheDocument();
      await user.selectOptions(screen.getByLabelText("Поле пошуку"), "city");
      expect(screen.getByText("1 / 2")).toBeInTheDocument();
    });
  });

  it("uses grid layout with configurable columns", () => {
    renderList({ layout: "grid", columnsAmount: 3 });
    const list = screen.getByRole("list");
    expect(list).toHaveClass("grid-layout");
    expect(list.style.gridTemplateColumns).toBe("repeat(3, 1fr)");
  });

  it("uses grid layout without inline columns when amount not given", () => {
    renderList({ layout: "grid" });
    expect(screen.getByRole("list").style.gridTemplateColumns).toBe("");
  });

  it("shows empty message for empty data", () => {
    renderList({ data: [] });
    expect(screen.getByText("Нічого не знайдено")).toBeInTheDocument();
    expect(within(screen.getByLabelText("Поле пошуку")).getAllByRole("option")).toHaveLength(1);
  });
});
