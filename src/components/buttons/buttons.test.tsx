import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PencilIcon, TrashIcon } from "lucide-react";
import TextButton from "./TextButton";
import RoundIconButton from "./RoundIconButton";
import ControlButtons from "./ControlButtons";

describe("TextButton", () => {
  it("renders text with default blue theme", () => {
    render(<TextButton textValue="Save" />);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveClass("text-button", "blue");
    expect(button).not.toHaveClass("small");
    expect(button).not.toHaveClass("secondary");
  });

  it("applies small, secondary and theme modifiers", () => {
    render(<TextButton textValue="Delete" isSmall isSecondary theme="red" />);
    expect(screen.getByRole("button")).toHaveClass("text-button", "small", "secondary", "red");
  });

  it("forwards native props and handles clicks", async () => {
    const onClick = vi.fn();
    render(<TextButton textValue="Go" type="submit" onClick={onClick} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
    await userEvent.setup().click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire clicks when disabled", async () => {
    const onClick = vi.fn();
    render(<TextButton textValue="Go" disabled onClick={onClick} />);
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("RoundIconButton", () => {
  it("renders icon and forwards props", async () => {
    const onClick = vi.fn();
    render(<RoundIconButton Icon={PencilIcon} aria-label="edit" onClick={onClick} />);
    const button = screen.getByRole("button", { name: "edit" });
    expect(button).toHaveClass("control-button");
    expect(button).not.toHaveClass("primary-red");
    expect(button.querySelector("svg")).toBeInTheDocument();
    await userEvent.setup().click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies red styling", () => {
    render(<RoundIconButton Icon={TrashIcon} isRed aria-label="delete" />);
    expect(screen.getByRole("button", { name: "delete" })).toHaveClass("primary-red");
  });
});

describe("ControlButtons", () => {
  it("renders a button per control and wires handlers", async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <ControlButtons
        controls={[
          { Icon: PencilIcon, onClick: onEdit, "aria-label": "edit" },
          { Icon: TrashIcon, isRed: true, onClick: onDelete, "aria-label": "delete" },
        ]}
      />
    );
    expect(screen.getAllByRole("button")).toHaveLength(2);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "delete" })).toHaveClass("primary-red");
  });

  it("renders nothing inside container for empty controls", () => {
    const { container } = render(<ControlButtons controls={[]} />);
    expect(container.querySelector(".button-container")).toBeEmptyDOMElement();
  });
});
