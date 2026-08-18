import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { requestAccessAction } from "@/app/[locale]/(app)/app/access/actions";
import { createCompanyAction } from "@/app/[locale]/(app)/app/company/actions";
import { AccessRequestForm } from "@/components/portal/AccessRequestForm";
import { CompanyCreationForm } from "@/components/portal/CompanyCreationForm";
import { Badge } from "@/components/ui/Badge";
import { getUserAccessRequests } from "@/lib/users";
import type { UnassignedPrincipal } from "@/types";

export async function AccessPending({
  principal,
  locale,
}: {
  principal: UnassignedPrincipal;
  locale: string;
}) {
  const [t, requests] = await Promise.all([
    getTranslations({ locale, namespace: "portal.onboarding" }),
    getUserAccessRequests(principal),
  ]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <section className="w-full max-w-2xl rounded-card border border-line bg-paper p-8 md:p-12">
        <Image
          src="/brand/sdk-logo-light.png"
          alt="SDK Enterprises"
          width={140}
          height={43}
          priority
          className="h-auto w-[140px]"
        />
        <p className="mt-12 text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 text-[32px] font-extrabold md:text-h1">{t("title")}</h1>
        <p className="mt-6 max-w-[60ch] text-body text-muted-foreground">
          {t("intro", { email: principal.email })}
        </p>
        <CompanyCreationForm
          action={createCompanyAction.bind(null, locale)}
          label={t("create")}
          nameLabel={t("name")}
        />
        <p className="mt-6 text-body text-muted-foreground">{t("alternative")}</p>

        <div className="mt-10 border-t border-line pt-8">
          <h2 className="text-h3 font-extrabold">{t("accessTitle")}</h2>
          <p className="mt-3 max-w-[60ch] text-body text-muted-foreground">{t("accessIntro")}</p>
          <AccessRequestForm
            action={requestAccessAction.bind(null, locale)}
            submitLabel={t("requestAccess")}
            codeLabel={t("accessCode")}
            roleLabel={t("accessRole")}
          />
        </div>

        <div className="mt-10 border-t border-line pt-8">
          <h2 className="text-h3 font-extrabold">{t("requestsTitle")}</h2>
          <div className="mt-5 space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between gap-4 rounded-control border border-line px-4 py-3"
              >
                <div>
                  <p className="text-body font-semibold">{request.company.name}</p>
                  <p className="mt-1 text-micro uppercase tracking-eyebrow text-muted-foreground">
                    {request.requestedRole.replaceAll("_", " ")} ·{" "}
                    {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                      request.createdAt
                    )}
                  </p>
                </div>
                <Badge
                  tone={
                    request.status === "PENDING"
                      ? "live"
                      : request.status === "APPROVED"
                        ? "live"
                        : "neutral"
                  }
                >
                  {t(`accessStatus.${request.status}`)}
                </Badge>
              </div>
            ))}
            {!requests.length ? (
              <p className="text-body text-muted-foreground">{t("requestsEmpty")}</p>
            ) : null}
          </div>
        </div>

        <Link
          href="/auth/logout"
          className="mt-10 inline-flex rounded-control bg-dark px-[18px] py-[14px] text-label font-extrabold uppercase tracking-eyebrow text-light hover:bg-dark/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark"
        >
          {t("logout")}
        </Link>
      </section>
    </main>
  );
}
