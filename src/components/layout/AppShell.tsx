import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { updatePreferredLocaleAction } from "@/app/[locale]/(app)/app/profile/actions";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { ActiveCompanyLabel } from "@/components/layout/ActiveCompanyLabel";
import { AppNav } from "@/components/layout/AppNav";
import type { AssignedPrincipal } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  locale: string;
  principal: AssignedPrincipal;
}

export async function AppShell({ children, locale, principal }: AppShellProps) {
  const t = await getTranslations({ locale, namespace: "portal.nav" });
  const areaLabel = principal.kind === "client" ? t("clientArea") : t("staffArea");
  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-dark text-light lg:min-h-screen lg:border-r lg:border-b-0 lg:border-r-dark-deep">
        <div className="flex min-h-20 items-center justify-between px-6 lg:block lg:px-7 lg:py-8">
          <Image
            src="/brand/sdk-logo-dark.png"
            alt="SDK Enterprises"
            width={140}
            height={43}
            priority
            className="h-auto w-[120px]"
          />
          <span className="text-micro uppercase tracking-eyebrow text-fog lg:mt-8 lg:block">
            {areaLabel}
          </span>
        </div>
        <nav aria-label="Application" className="border-t border-dark-deep px-3 py-3 lg:px-4">
          <AppNav
            locale={locale}
            principal={principal}
            labels={{
              dashboard: t("dashboard"),
              requests: t("requests"),
              operations: t("operations"),
              companies: t("companies"),
              team: t("team"),
              users: t("users"),
              opportunities: t("opportunities"),
              invitations: t("invitations"),
            }}
          />
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-20 items-center justify-between gap-6 border-b border-line px-6 lg:px-10">
          <div>
            <p className="text-micro uppercase tracking-eyebrow text-muted-foreground">
              <ActiveCompanyLabel principal={principal} fallback="SDK Enterprises" />
            </p>
            <p className="mt-1 text-body font-semibold">{principal.name}</p>
          </div>
          <AccountMenu
            locale={locale}
            name={principal.name}
            email={principal.email}
            avatarUrl={principal.avatarUrl}
            profileLabel={t("profile")}
            logoutLabel={t("logout")}
            languageLabel={t("language")}
            updateLocale={updatePreferredLocaleAction}
          />
        </header>
        <main className="px-6 py-12 lg:px-10 lg:py-16">{children}</main>
      </div>
    </div>
  );
}
