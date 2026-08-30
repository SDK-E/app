import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Avatar, AvatarFallback } from "@sdk-e/ui/Avatar";

describe("Avatar", () => {
  afterEach(() => cleanup());

  it("shows the fallback initials when no image is present", () => {
    render(
      <Avatar aria-label="Hind Debbi">
        <AvatarFallback>HD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText("HD")).not.toBeNull();
  });
});
