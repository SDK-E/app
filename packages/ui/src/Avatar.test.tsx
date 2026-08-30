import { Avatar, AvatarFallback } from "@platform/ui/Avatar";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

describe("Avatar", () => {
  afterEach(() => cleanup());

  it("shows the fallback initials when no image is present", () => {
    render(
      <Avatar aria-label="Hind Debbi">
        <AvatarFallback>HD</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("HD")).not.toBeNull();
  });
});
