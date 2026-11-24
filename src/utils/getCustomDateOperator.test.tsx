import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { GridFilterInputValueProps, GridFilterItem } from "@mui/x-data-grid";
import { betweenDateOperator, getCustomDateOperators } from "./getCustomDateOperator";

const renderInput = (value?: string) => {
  const applyValue = vi.fn();
  const item: GridFilterItem = { field: "date", operator: "between", value };
  const Input = betweenDateOperator.InputComponent!;
  render(<Input {...({ item, applyValue } as unknown as GridFilterInputValueProps)} />);
  return { applyValue, item };
};

describe("betweenDateOperator", () => {
  it("has metadata and no client-side filter", () => {
    expect(betweenDateOperator.value).toBe("between");
    expect(betweenDateOperator.label).toBe("в діапазоні");
    expect(
      betweenDateOperator.getApplyFilterFn({ field: "d", operator: "between" }, {} as never)
    ).toBeNull();
  });

  it("renders empty from/to inputs when no value", () => {
    renderInput();
    expect(screen.getByLabelText("Від")).toHaveValue("");
    expect(screen.getByLabelText("До")).toHaveValue("");
  });

  it("splits stored value into from/to inputs", () => {
    renderInput("2025-01-01;2025-02-01");
    expect(screen.getByLabelText("Від")).toHaveValue("2025-01-01");
    expect(screen.getByLabelText("До")).toHaveValue("2025-02-01");
  });

  it("updates 'from' part preserving 'to'", () => {
    const { applyValue, item } = renderInput("2025-01-01;2025-02-01");
    fireEvent.change(screen.getByLabelText("Від"), { target: { value: "2025-01-15" } });
    expect(applyValue).toHaveBeenCalledWith({ ...item, value: "2025-01-15;2025-02-01" });
  });

  it("updates 'to' part preserving 'from'", () => {
    const { applyValue, item } = renderInput("2025-01-01;2025-02-01");
    fireEvent.change(screen.getByLabelText("До"), { target: { value: "2025-03-01" } });
    expect(applyValue).toHaveBeenCalledWith({ ...item, value: "2025-01-01;2025-03-01" });
  });
});

describe("getCustomDateOperators", () => {
  it("drops isEmpty/isNotEmpty and appends between operator", () => {
    const ops = getCustomDateOperators();
    const values = ops.map((o) => o.value);
    expect(values).not.toContain("isEmpty");
    expect(values).not.toContain("isNotEmpty");
    expect(values).toContain("is");
    expect(ops[ops.length - 1]).toBe(betweenDateOperator);
  });
});
