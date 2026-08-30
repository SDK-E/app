import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Progress } from "@sdk-e/ui/Progress";

describe("Progress", () => {
  afterEach(() => cleanup());

  it("renders progressbar semantics with the current value", () => {
    render(<Progress value={60} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("60");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });
});
