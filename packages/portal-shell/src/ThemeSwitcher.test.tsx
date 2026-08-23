import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useTheme: vi.fn(),
  updatePreferredThemeAction: vi.fn(),
}));

vi.mock("next-themes", () => ({ useTheme: mocks.useTheme }));
vi.mock("@/app/[locale]/(app)/app/profile/actions", () => ({
  updatePreferredThemeAction: mocks.updatePreferredThemeAction,
}));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    ({ light: "Light theme", dark: "Dark theme", system: "System theme" })[key] ?? key,
}));

import { ThemeSwitcher } from "@sdk-e/portal-shell/ThemeSwitcher";

function arrange(theme: string) {
  const setTheme = vi.fn();
  mocks.useTheme.mockReturnValue({ theme, setTheme });
  return setTheme;
}

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.updatePreferredThemeAction.mockResolvedValue({ ok: true });
  });
  afterEach(() => cleanup());

  it("offers all three theme options", () => {
    arrange("light");
    render(<ThemeSwitcher />);

    expect(screen.getByRole("button", { name: "Light theme" }).getAttribute("aria-label")).toBe(
      "Light theme"
    );
    expect(screen.getByRole("button", { name: "Dark theme" }).getAttribute("aria-label")).toBe(
      "Dark theme"
    );
    expect(screen.getByRole("button", { name: "System theme" }).getAttribute("aria-label")).toBe(
      "System theme"
    );
  });

  it.each([
    ["light", "Light theme"],
    ["dark", "Dark theme"],
    ["system", "System theme"],
  ] as const)("marks %s as the pressed option when active", (theme, label) => {
    arrange(theme);
    render(<ThemeSwitcher />);

    expect(screen.getByRole("button", { name: label }).getAttribute("aria-pressed")).toBe("true");
  });

  it("applies the picked theme immediately and persists the choice", () => {
    const setTheme = arrange("light");
    render(<ThemeSwitcher />);

    fireEvent.click(screen.getByRole("button", { name: "Dark theme" }));

    expect(setTheme).toHaveBeenCalledWith("dark");
    expect(mocks.updatePreferredThemeAction).toHaveBeenCalledWith("dark");
  });

  it("ignores picking the already-active theme", () => {
    const setTheme = arrange("system");
    render(<ThemeSwitcher />);

    fireEvent.click(screen.getByRole("button", { name: "System theme" }));

    expect(setTheme).not.toHaveBeenCalled();
    expect(mocks.updatePreferredThemeAction).not.toHaveBeenCalled();
  });
});
