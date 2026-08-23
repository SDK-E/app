import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EmptyState } from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  afterEach(() => cleanup());

  it("uses semantic surface tokens so its text survives dark-mode inversion", () => {
    const { container } = render(
      <EmptyState title="No requests yet" description="Nothing here yet." />
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("bg-card");
    expect(el.className).toContain("text-card-foreground");
  });

  it("renders title and description", () => {
    const { getByText } = render(
      <EmptyState title="No requests yet" description="When a request exists, it appears here." />
    );
    expect(getByText("No requests yet").tagName).toBe("H3");
    expect(getByText("When a request exists, it appears here.").tagName).toBe("P");
  });
});
