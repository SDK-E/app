import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Switch } from "@sdk-e/ui/Switch";

describe("Switch", () => {
  afterEach(() => cleanup());

  it("flips state on activation", () => {
    const { getByRole } = render(<Switch aria-label="Production alerts" />);
    const toggle = getByRole("switch");

    expect(toggle.getAttribute("data-state")).toBe("unchecked");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("data-state")).toBe("checked");
  });
});
