import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Spinner } from "@/components/ui/Spinner";

describe("Spinner", () => {
  afterEach(() => cleanup());

  it("exposes status semantics with an accessible name", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).not.toBeNull();
    expect(screen.getByText("Loading")).not.toBeNull();
  });

  it("accepts a custom accessible label", () => {
    render(<Spinner label="Syncing projects" />);
    expect(screen.getByText("Syncing projects")).not.toBeNull();
  });

  it("keeps the glyph out of the accessibility tree", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });
});
