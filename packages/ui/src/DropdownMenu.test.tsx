import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import * as React from "react";

import { Button } from "@sdk-e/ui/Button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@sdk-e/ui/DropdownMenu";

function MenuHarness() {
  const [digests, setDigests] = React.useState(true);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Account
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Signed in</DropdownMenuLabel>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuCheckboxItem
          checked={digests}
          onCheckedChange={(value) => setDigests(value === true)}
        >
          Email digests
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function renderMenu() {
  return render(<MenuHarness />);
}

function openMenu() {
  const trigger = screen.getByRole("button", { name: "Account" });
  fireEvent.pointerDown(trigger, { pointerType: "mouse" });
  fireEvent.click(trigger);
}

describe("DropdownMenu", () => {
  afterEach(() => cleanup());

  it("opens from its trigger and closes on Escape", async () => {
    renderMenu();

    expect(screen.queryByText("Signed in")).toBeNull();

    openMenu();
    expect(screen.getByText("Profile")).not.toBeNull();

    fireEvent.keyDown(screen.getByText("Profile"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menuitem", { name: "Profile" })).toBeNull());
  });

  it("toggles a checkbox item via keyboard activation", () => {
    renderMenu();
    openMenu();

    const item = screen.getByRole("menuitemcheckbox", { name: "Email digests" });
    expect(item.getAttribute("aria-checked")).toBe("true");

    item.focus();
    fireEvent.keyDown(item, { key: "Enter" });
    expect(item.getAttribute("aria-checked")).toBe("false");
  });
});
