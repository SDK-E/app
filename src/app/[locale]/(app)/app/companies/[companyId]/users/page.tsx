import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { DirectorySection } from "@/components/portal/users/DirectorySection";
import { InviteSection } from "@/components/portal/users/InviteSection";
import { RequestsSection } from "@/components/portal/users/RequestsSection";
import { getClientMembership } from "@/lib/auth/authorization";
import { getCurrentPrincipal } from "@/lib/auth/identity";
import { getUserManagementData } from "@/lib/users";

export const metadata: Metadata = {
  title: "Team | SDK Enterprises",
  robots: { index: false, follow: false },
};

export default async function CompanyUsersPage({
  params,
}: {
  params: Promise<{ locale: string; companyId: string }>;
}) {
  const [{ locale, companyId }, principal] = await Promise.all([params, getCurrentPrincipal()]);
  if (!principal || principal.kind !== "client") return null;
  const isManager = (() => {
    try {
      return ["OWNER", "ADMINISTRATOR"].includes(getClientMembership(principal, companyId).role);
    } catch {
      return false;
    }
  })();
  if (!isManager) redirect(`/${locale}/app/companies/${companyId}`);
  const [t, data] = await Promise.all([
    getTranslations({ locale, namespace: "portal.users" }),
    getUserManagementData(principal, companyId),
  ]);
  const myRole = getClientMembership(principal, companyId).role;
  const clientRoles =
    myRole === "ADMINISTRATOR"
      ? ["PROJECT_MEMBER", "BILLING", "VIEWER"]
      : ["ADMINISTRATOR", "PROJECT_MEMBER", "BILLING", "VIEWER"];
  return (
    <section>
      <p className="text-label font-extrabold uppercase tracking-eyebrow">{t("eyebrow")}</p>
      <h1 className="mt-4 text-[32px] font-extrabold md:text-h1">{t("title")}</h1>
      <p className="mt-5 max-w-[65ch] text-body text-muted-foreground">{t("intro")}</p>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <InviteSection
          locale={locale}
          companyId={companyId}
          data={data}
          principal={principal}
          clientRoles={clientRoles}
        />
      </div>

      <DirectorySection
        locale={locale}
        companyId={companyId}
        data={data}
        clientRoles={clientRoles}
      />
      <RequestsSection
        locale={locale}
        companyId={companyId}
        data={data}
        clientRoles={clientRoles}
      />
    </section>
  );
}
