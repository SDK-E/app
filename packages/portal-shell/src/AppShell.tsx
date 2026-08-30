import type { AssignedPrincipal } from "@platform/types";

import { AppShellFrame } from "@platform/portal-shell/AppShellFrame";
import { getTranslations } from "next-intl/server";

import { updatePreferredLocaleAction } from "@/app/[locale]/(app)/app/profile/actions";

interface AppShellProps {
  children: React.ReactNode;
  locale: string;
  principal: AssignedPrincipal;
}

export async function AppShell({ children, locale, principal }: AppShellProps) {
  const t = await getTranslations({ locale, namespace: "portal.nav" });
  const areaLabel = principal.kind === "client" ? t("clientArea") : t("staffArea");
  return (
    <AppShellFrame
      locale={locale}
      principal={principal}
      areaLabel={areaLabel}
      fallbackLabel="SDK Enterprises"
      updateLocale={updatePreferredLocaleAction}
      labels={{
        dashboard: t("dashboard"),
        requests: t("requests"),
        operations: t("operations"),
        companies: t("companies"),
        team: t("team"),
        users: t("users"),
        opportunities: t("opportunities"),
        invitations: t("invitations"),
        profile: t("profile"),
        logout: t("logout"),
        language: t("language"),
        theme: t("theme"),
        collapseSidebar: t("collapseSidebar"),
        expandSidebar: t("expandSidebar"),
      }}
    >
      {children}
    </AppShellFrame>
  );
}
