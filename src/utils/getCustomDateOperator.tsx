// getCustomDateOperators.ts

import {
  GridFilterOperator,
  getGridDateOperators,
  GridFilterInputValueProps,
} from "@mui/x-data-grid";
import { TextField } from "@mui/material";
import React from "react";

export const betweenDateOperator: GridFilterOperator = {
  label: "в діапазоні",
  value: "between",
  getApplyFilterFn: () => null,
  InputComponent: ({ item, applyValue }: GridFilterInputValueProps) => {
    const [from, to] = item.value?.split(";") ?? ["", ""];

    const handleChange =
      (index: 0 | 1) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const updated =
          index === 0
            ? `${event.target.value};${to}`
            : `${from};${event.target.value}`;
        applyValue({ ...item, value: updated });
      };

    return (
      <div style={{ display: "flex", gap: 12 }}>
        <TextField
          type="date"
          label="Від"
          value={from}
          onChange={handleChange(0)}
          size="small"
          sx={{ minWidth: 160 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="До"
          value={to}
          onChange={handleChange(1)}
          size="small"
          sx={{ minWidth: 160 }}
          InputLabelProps={{ shrink: true }}
        />
      </div>
    );
  },
};

export function getCustomDateOperators(): GridFilterOperator[] {
  return getGridDateOperators()
    .filter((op) => op.value !== "isEmpty" && op.value !== "isNotEmpty")
    .concat(betweenDateOperator);
}
