import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ErrorState } from "@/components/ui/ErrorState";

describe("ErrorState", () => {
  afterEach(() => cleanup());

  it("pins a mode-safe ink so its text survives dark-mode surface inversion", () => {
    const { container } = render(<ErrorState title="Something failed" description="Try again." />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("bg-paper");
    expect(el.className).toContain("text-dark");
    expect(el.textContent).not.toContain("undefined");
  });

  it("renders label, title and description inside the pinned surface", () => {
    const { getByText } = render(
      <ErrorState label="Error" title="Something failed" description="Try again." />
    );
    expect(getByText("Error").className).toContain("tracking-label");
    expect(getByText("Something failed").tagName).toBe("H3");
    expect(getByText("Try again.").tagName).toBe("P");
  });
});
