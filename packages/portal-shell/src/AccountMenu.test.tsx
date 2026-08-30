import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  LanguageSwitcher: vi.fn(),
  ThemeSwitcher: vi.fn(),
}));

vi.mock("@platform/portal-shell/LanguageSwitcher", () => ({
  LanguageSwitcher: mocks.LanguageSwitcher,
}));
vi.mock("@platform/portal-shell/ThemeSwitcher", () => ({
  ThemeSwitcher: mocks.ThemeSwitcher,
}));

import { AccountMenu } from "@platform/portal-shell/AccountMenu";

const baseProps = {
  locale: "en",
  name: "Ada Lovelace",
  email: "ada@example.com",
  avatarUrl: null as null | string,
  profileLabel: "Profile",
  logoutLabel: "Log out",
  languageLabel: "Language",
  themeLabel: "Theme",
  updateLocale: async () => ({ ok: true }),
};

function arrange() {
  mocks.LanguageSwitcher.mockReturnValue(<div>language switcher</div>);
  mocks.ThemeSwitcher.mockReturnValue(<div>theme switcher</div>);
}

describe("AccountMenu", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    arrange();
  });
  afterEach(() => cleanup());

  it("expands the sidebar instead of opening a menu when collapsed on the rail", () => {
    const onExpand = vi.fn();
    render(
      <AccountMenu
        {...baseProps}
        variant="sidebar"
        collapsed
        onExpand={onExpand}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Ada Lovelace" }));

    expect(onExpand).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens the design-system menu with language, theme, profile and logout", () => {
    render(<AccountMenu {...baseProps} />);
    const trigger = screen.getByRole("button", { name: "Ada Lovelace" });

    fireEvent.pointerDown(trigger, { pointerType: "mouse" });
    fireEvent.click(trigger);

    expect(screen.getByRole("menu")).toBeTruthy();
    expect(screen.getByText("Language")).toBeTruthy();
    expect(screen.getByText("Theme")).toBeTruthy();
    expect(screen.getAllByRole("menuitem", { name: "Profile" })[0].getAttribute("href")).toBe(
      "/en/app/profile",
    );
    expect(screen.getAllByRole("menuitem", { name: "Log out" })[0].getAttribute("href")).toBe(
      "/auth/logout",
    );
  });
});
