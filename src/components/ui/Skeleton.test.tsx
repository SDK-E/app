import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Skeleton } from "@/components/ui/Skeleton";

describe("Skeleton", () => {
  afterEach(() => cleanup());

  it("is hidden from assistive technology and theme-aware", () => {
    const { container } = render(<Skeleton className="h-4 w-2/3" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.className).toContain("bg-muted");
    expect(el.className).toContain("h-4");
  });

  it("lets consumers override the base classes", () => {
    const { container } = render(<Skeleton className="rounded-none bg-card" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).not.toContain("bg-muted");
    expect(el.className).toContain("bg-card");
  });
});
