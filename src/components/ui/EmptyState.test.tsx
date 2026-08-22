import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EmptyState } from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  afterEach(() => cleanup());

  it("pins a mode-safe ink so its text survives dark-mode surface inversion", () => {
    const { container } = render(
      <EmptyState title="No requests yet" description="Nothing here yet." />
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("bg-paper");
    expect(el.className).toContain("text-dark");
  });

  it("renders title and description", () => {
    const { getByText } = render(
      <EmptyState title="No requests yet" description="When a request exists, it appears here." />
    );
    expect(getByText("No requests yet").tagName).toBe("H3");
    expect(getByText("When a request exists, it appears here.").tagName).toBe("P");
  });
});
