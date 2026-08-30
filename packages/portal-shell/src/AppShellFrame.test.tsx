import type { ClientPrincipal } from "@platform/types";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  AppNav: vi.fn(),
  AccountMenu: vi.fn(),
  ActiveCompanyLabel: vi.fn(),
}));

vi.mock("@platform/portal-shell/AppNav", () => ({ AppNav: mocks.AppNav }));
vi.mock("@platform/portal-shell/AccountMenu", () => ({ AccountMenu: mocks.AccountMenu }));
vi.mock("@platform/portal-shell/ActiveCompanyLabel", () => ({
  ActiveCompanyLabel: mocks.ActiveCompanyLabel,
}));

import { AppShellFrame } from "@platform/portal-shell/AppShellFrame";

const STORAGE_KEY = "sdk.portal.sidebar.collapsed";

const principal: ClientPrincipal = {
  kind: "client",
  id: "user-1",
  auth0Sub: "auth0|user-1",
  email: "ada@example.com",
  name: "Ada Lovelace",
  avatarUrl: null,
  preferredLocale: "en",
  preferredTheme: "system",
  memberships: [{ companyId: "company-1", companyName: "Acme", role: "OWNER" }],
};

const labels = {
  dashboard: "Dashboard",
  requests: "Requests",
  operations: "Operations",
  companies: "Companies",
  team: "Team",
  users: "Users",
  opportunities: "Opportunities",
  invitations: "Invitations",
  profile: "Profile",
  logout: "Log out",
  language: "Language",
  theme: "Theme",
  collapseSidebar: "Collapse sidebar",
  expandSidebar: "Expand sidebar",
};

function arrange() {
  mocks.AppNav.mockReturnValue(<nav>Navigation</nav>);
  mocks.ActiveCompanyLabel.mockReturnValue(<span>Acme</span>);
  mocks.AccountMenu.mockImplementation(({ variant }: { variant?: string }) => (
    <div>account menu {variant}</div>
  ));
  return render(
    <AppShellFrame
      locale="en"
      principal={principal}
      areaLabel="Client portal"
      fallbackLabel="SDK Enterprises"
      labels={labels}
      updateLocale={async () => ({ ok: true })}
    >
      <p>Page content</p>
    </AppShellFrame>,
  );
}

function installStorage(): Map<string, string> {
  const store = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
      setItem: (key: string, value: string) => void store.set(key, value),
    },
    configurable: true,
  });
  return store;
}

describe("AppShellFrame sidebar collapse", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    installStorage();
  });
  afterEach(() => cleanup());

  it("renders an expanded sidebar toggle wired to the sidebar region", () => {
    arrange();

    const toggle = screen.getByRole("button", { name: "Collapse sidebar" });
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.getAttribute("aria-controls")).toBe("app-sidebar");
  });

  it("collapses, swaps the accessible state and remembers the choice", () => {
    arrange();

    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    const collapsed = screen.getByRole("button", { name: "Expand sidebar" });
    expect(collapsed.getAttribute("aria-expanded")).toBe("false");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("1");

    fireEvent.click(collapsed);

    expect(
      screen.getByRole("button", { name: "Collapse sidebar" }).getAttribute("aria-expanded"),
    ).toBe("true");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("0");
  });

  it("starts collapsed when a collapsed choice is already stored", () => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    arrange();

    const toggle = screen.getByRole("button", { name: "Expand sidebar" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("starts expanded when the stored choice is expanded", () => {
    window.localStorage.setItem(STORAGE_KEY, "0");
    arrange();

    expect(
      screen.getByRole("button", { name: "Collapse sidebar" }).getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it("expands the rail again when the account menu requests expansion", () => {
    arrange();
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }).getAttribute("aria-expanded"),
    ).toBe("false");

    const sidebarMenuCall = mocks.AccountMenu.mock.calls.find(
      ([props]) => (props as { variant?: string }).variant === "sidebar",
    );
    const menuProps = sidebarMenuCall?.[0] as { onExpand?: () => void };
    act(() => {
      menuProps.onExpand?.();
    });

    expect(
      screen.getByRole("button", { name: "Collapse sidebar" }).getAttribute("aria-expanded"),
    ).toBe("true");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("0");
  });
});
