"use client";

import type { AssignedPrincipal } from "@platform/types";

import { AccountMenu } from "@platform/portal-shell/AccountMenu";
import { ActiveCompanyLabel } from "@platform/portal-shell/ActiveCompanyLabel";
import { AppNav } from "@platform/portal-shell/AppNav";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const STORAGE_KEY = "sdk.portal.sidebar.collapsed";

interface AppShellFrameLabels {
  dashboard: string;
  requests: string;
  operations: string;
  companies: string;
  team: string;
  users: string;
  opportunities: string;
  invitations: string;
  profile: string;
  logout: string;
  language: string;
  theme: string;
  collapseSidebar: string;
  expandSidebar: string;
}

export function AppShellFrame({
  locale,
  principal,
  areaLabel,
  fallbackLabel,
  labels,
  updateLocale,
  children,
}: {
  locale: string;
  principal: AssignedPrincipal;
  areaLabel: string;
  fallbackLabel: string;
  labels: AppShellFrameLabels;
  updateLocale: (locale: string) => Promise<{ ok: boolean }>;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(readStoredCollapsed());
  }, []);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      persistCollapsed(next);
      return next;
    });
  }

  function expandSidebar() {
    persistCollapsed(false);
    setCollapsed(false);
  }

  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const toggleLabel = collapsed ? labels.expandSidebar : labels.collapseSidebar;

  return (
    <div
      className={`min-h-screen bg-background text-foreground transition-[grid-template-columns] duration-200 ease-out motion-reduce:transition-none lg:grid ${
        collapsed ? "lg:grid-cols-[72px_1fr]" : "lg:grid-cols-[260px_1fr]"
      }`}
    >
      <aside
        id="app-sidebar"
        className="overflow-hidden border-b border-line bg-sidebar text-light lg:flex lg:min-h-screen lg:flex-col lg:border-b-0 lg:border-r lg:border-r-sidebar-border"
      >
        <div
          className={`flex min-h-20 items-center justify-between gap-x-3 px-6 lg:min-h-0 lg:flex-col lg:items-stretch lg:py-8 ${
            collapsed ? "lg:px-0" : ""
          }`}
        >
          <div
            className={`flex min-w-0 items-center gap-x-3 ${
              collapsed ? "lg:justify-center" : "lg:justify-between"
            }`}
          >
            <Image
              src="/brand/sdk-logo-dark.png"
              alt="SDK Enterprises"
              width={140}
              height={43}
              priority
              className={`h-auto w-[120px] ${collapsed ? "lg:hidden" : ""}`}
            />
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-expanded={!collapsed}
              aria-controls="app-sidebar"
              aria-label={toggleLabel}
              title={toggleLabel}
              className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-nav text-light transition-colors hover:bg-dark-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none lg:inline-flex"
            >
              <ToggleIcon
                className="h-5 w-5"
                aria-hidden
              />
            </button>
          </div>
          <span
            className={`text-micro uppercase tracking-eyebrow text-fog lg:mt-8 lg:block ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            {areaLabel}
          </span>
        </div>
        <nav
          aria-label="Application"
          className="border-t border-dark-deep px-3 py-3 lg:flex-1 lg:px-4"
        >
          <AppNav
            locale={locale}
            principal={principal}
            labels={labels}
            collapsed={collapsed}
          />
        </nav>
        <div className="relative hidden border-t border-dark-deep px-3 py-3 lg:block lg:px-4">
          <AccountMenu
            variant="sidebar"
            collapsed={collapsed}
            onExpand={expandSidebar}
            locale={locale}
            name={principal.name}
            email={principal.email}
            avatarUrl={principal.avatarUrl}
            profileLabel={labels.profile}
            logoutLabel={labels.logout}
            languageLabel={labels.language}
            themeLabel={labels.theme}
            updateLocale={updateLocale}
          />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-20 items-center justify-between gap-6 border-b border-line px-6 lg:px-10">
          <div>
            <p className="text-micro uppercase tracking-eyebrow text-muted-foreground">
              <ActiveCompanyLabel
                principal={principal}
                fallback={fallbackLabel}
              />
            </p>
            <p className="mt-1 text-body font-semibold">{principal.name}</p>
          </div>
          <div className="lg:hidden">
            <AccountMenu
              variant="header"
              locale={locale}
              name={principal.name}
              email={principal.email}
              avatarUrl={principal.avatarUrl}
              profileLabel={labels.profile}
              logoutLabel={labels.logout}
              languageLabel={labels.language}
              themeLabel={labels.theme}
              updateLocale={updateLocale}
            />
          </div>
        </header>
        <main className="px-6 py-12 lg:px-10 lg:py-16">{children}</main>
      </div>
    </div>
  );
}

function persistCollapsed(value: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    return;
  }
}

function readStoredCollapsed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
