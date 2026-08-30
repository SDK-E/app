import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    ({ home: "Home", main: "Main", toggleMenu: "Toggle menu", openPortal: "Open portal" })[key] ??
    key,
}));
vi.mock("@platform/portal-shell/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <span>Language switcher</span>,
}));
vi.mock("@platform/portal-shell/ThemeSwitcher", () => ({
  ThemeSwitcher: () => <span>Theme switcher</span>,
}));

import { Header } from "@/components/layout/Header";

const commonProps = {
  links: [{ label: "Services", href: "/services" }],
  cta: { label: "Discuss a project", href: "/start-a-project" },
  secondaryCta: { label: "Sign in", href: "/en/login" },
  locale: "en",
};

describe("Header account action", () => {
  afterEach(() => cleanup());

  it("shows Sign in to an anonymous visitor", () => {
    render(
      <Header
        {...commonProps}
        isAuthenticated={false}
      />,
    );

    expect(screen.getAllByRole("link", { name: "Sign in" })[0].getAttribute("href")).toBe(
      "/en/login",
    );
  });

  it("shows the localized portal link to an authenticated visitor", () => {
    render(
      <Header
        {...commonProps}
        isAuthenticated={true}
      />,
    );

    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(screen.getAllByRole("link", { name: "Open portal" })[0].getAttribute("href")).toBe(
      "/en/app",
    );
  });
});
