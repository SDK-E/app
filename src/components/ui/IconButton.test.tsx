import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { IconButton } from "@/components/ui/IconButton";

describe("IconButton", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("forwards the accessible name to the underlying button", () => {
    render(
      <IconButton aria-label="Settings">
        <span>icon</span>
      </IconButton>
    );
    expect(screen.getByRole("button", { name: "Settings" })).not.toBeNull();
  });

  it("warns in development when no accessible name is provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <IconButton>
        <span>icon</span>
      </IconButton>
    );
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain("aria-label");
  });
});
