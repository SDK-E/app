import { Checkbox } from "@platform/ui/Checkbox";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

describe("Checkbox", () => {
  afterEach(() => cleanup());

  it("toggles between checked and unchecked on activation", () => {
    const { getByRole } = render(<Checkbox aria-label="Include staging" />);
    const box = getByRole("checkbox");

    expect(box.getAttribute("data-state")).toBe("unchecked");
    fireEvent.click(box);
    expect(box.getAttribute("data-state")).toBe("checked");
    fireEvent.click(box);
    expect(box.getAttribute("data-state")).toBe("unchecked");
  });

  it("starts checked when defaultChecked", () => {
    const { getByRole } = render(
      <Checkbox
        defaultChecked
        aria-label="Include staging"
      />,
    );
    expect(getByRole("checkbox").getAttribute("data-state")).toBe("checked");
  });
});
