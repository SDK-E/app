import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import RootError from "./error";

describe("RootError", () => {
  afterEach(cleanup);

  it("renders the server-error page without a next-intl provider", () => {
    render(<RootError error={new Error("boom")} reset={() => {}} />);

    expect(screen.getByText("500 / SERVER ERROR")).toBeTruthy();
    expect(screen.getByText("Something failed on our side.")).toBeTruthy();
    expect(
      screen.getByText("The issue has been recorded. You can try again or return to the homepage.")
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to home" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "SDK Enterprises home" }).getAttribute("href")).toBe(
      "/"
    );
  });

  it("retries rendering through the reset callback", () => {
    let resets = 0;
    render(<RootError error={new Error("boom")} reset={() => void ++resets} />);

    screen.getByRole("button", { name: "Try again" }).click();

    expect(resets).toBe(1);
  });
});
