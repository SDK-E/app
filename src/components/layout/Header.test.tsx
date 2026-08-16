import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ useUser: vi.fn() }));

vi.mock("@auth0/nextjs-auth0/client", () => ({ useUser: mocks.useUser }));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) =>
    ({ home: "Home", main: "Main", toggleMenu: "Toggle menu", openPortal: "Open portal" })[
      key
    ] ?? key,
}));
vi.mock("@/components/layout/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <span>Language switcher</span>,
}));

import { Header } from "@/components/layout/Header";

const commonProps = {
  links: [{ label: "Services", href: "/services" }],
  cta: { label: "Discuss a project", href: "/start-a-project" },
  secondaryCta: { label: "Sign in", href: "/en/login" },
  locale: "en",
};

describe("Header account action", () => {
  beforeEach(() => mocks.useUser.mockReset());
  afterEach(() => cleanup());

  it("shows Sign in to an anonymous visitor", () => {
    mocks.useUser.mockReturnValue({ user: null, isLoading: false, error: null });
    render(<Header {...commonProps} />);

    expect(screen.getAllByRole("link", { name: "Sign in" })[0].getAttribute("href")).toBe(
      "/en/login"
    );
  });

  it("shows the localized portal link to an authenticated visitor", () => {
    mocks.useUser.mockReturnValue({
      user: { sub: "auth0|user" },
      isLoading: false,
      error: null,
    });
    render(<Header {...commonProps} />);

    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(screen.getAllByRole("link", { name: "Open portal" })[0].getAttribute("href")).toBe(
      "/en/app"
    );
  });
});
