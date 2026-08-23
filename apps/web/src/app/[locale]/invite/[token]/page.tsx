import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { acceptInvitationAction } from "@/app/[locale]/invite/[token]/actions";
import { InvitationAcceptForm } from "@/components/portal/InvitationAcceptForm";
import { Button } from "@sdk-e/ui/Button";
import { Card } from "@sdk-e/ui/Card";
import { getServerEnv } from "@sdk-e/env";
import { getCurrentPrincipal, IdentityError } from "@sdk-e/auth/identity";
import { getInvitationPreview } from "@sdk-e/users";
import { maskEmail, normalizeEmail } from "@sdk-e/core/utils";
import type { AppPrincipal } from "@sdk-e/types";

export const metadata: Metadata = {
  title: "Invitation | SDK Enterprises",
  robots: { index: false, follow: false },
};

async function origin() {
  const configured = getServerEnv().AUTH0_BASE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const values = await headers();
  return `${values.get("x-forwarded-proto") ?? "http"}://${values.get("host")}`;
}

type InvitationPreview = NonNullable<Awaited<ReturnType<typeof getInvitationPreview>>>;

function unavailableKind(
  invitation: InvitationPreview
): "expired" | "revoked" | "used" | "unknown" {
  if (invitation.revokedAt) return "revoked";
  if (invitation.acceptedAt) return "used";
  if (invitation.expiresAt <= new Date()) return "expired";
  return "unknown";
}

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const [t, invitation] = await Promise.all([
    getTranslations({ locale, namespace: "portal.invitation" }),
    getInvitationPreview(token),
  ]);
  let principal: AppPrincipal | null = null;
  try {
    principal = await getCurrentPrincipal();
  } catch (error) {
    if (!(error instanceof IdentityError)) throw error;
  }
  const inviteUrl = `/${locale}/invite/${token}`;
  const absoluteInviteUrl = `${await origin()}${inviteUrl}`;
  const available =
    !!invitation &&
    !invitation.acceptedAt &&
    !invitation.revokedAt &&
    invitation.expiresAt > new Date();
  const destination = invitation?.company?.name ?? "SDK Enterprises";
  const role = (invitation?.clientRole ?? invitation?.sdkStaffRole ?? "member")
    .replaceAll("_", " ")
    .toLowerCase();
  const matchesInvitee =
    !!principal &&
    !!invitation &&
    normalizeEmail(principal.email) === normalizeEmail(invitation.email);
  const unavailableCopy = invitation
    ? {
        expired: t("unavailableExpired", {
          date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
            invitation.expiresAt
          ),
        }),
        revoked: t("unavailableRevoked"),
        used: t("unavailableUsed"),
        unknown: t("unavailableBody"),
      }[unavailableKind(invitation)]
    : t("unavailableBody");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-xl">
        <p className="text-label font-extrabold uppercase tracking-eyebrow">SDK Enterprises</p>
        <h1 className="mt-4 text-[32px] font-extrabold md:text-h1">
          {available ? t("title") : t("unavailableTitle")}
        </h1>
        {available ? (
          <>
            <p className="mt-5 text-body text-dark-muted">{t("intro", { destination, role })}</p>
            <p className="mt-3 text-body text-dark-muted">
              {t("email", {
                email: matchesInvitee ? invitation.email : maskEmail(invitation.email),
              })}
            </p>
            {invitation.inviter?.name ? (
              <p className="mt-3 text-body text-dark-muted">
                {t("invitedBy", { name: invitation.inviter.name })}
              </p>
            ) : null}
            <p className="mt-3 text-body text-dark-muted">
              {t("expires", {
                date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                  invitation.expiresAt
                ),
              })}
            </p>
            {!principal ? (
              <div className="mt-8 space-y-3">
                <Button
                  href={`/auth/login?screen_hint=signup&login_hint=${encodeURIComponent(invitation.email)}&returnTo=${encodeURIComponent(absoluteInviteUrl)}`}
                  className="w-full"
                >
                  {t("signup")}
                </Button>
                <Button
                  href={`/auth/login?login_hint=${encodeURIComponent(invitation.email)}&returnTo=${encodeURIComponent(absoluteInviteUrl)}`}
                  variant="outline"
                  className="w-full"
                >
                  {t("haveAccount")}
                </Button>
              </div>
            ) : matchesInvitee && principal.kind === "unassigned" ? (
              <InvitationAcceptForm
                action={acceptInvitationAction.bind(null, locale, token)}
                label={t("accept")}
              />
            ) : matchesInvitee ? (
              <div className="mt-8 space-y-3">
                <p role="alert" className="text-body">
                  {t("alreadyAssigned")}
                </p>
                <Button href={`/${locale}/app`} className="w-full">
                  {t("openPortal")}
                </Button>
              </div>
            ) : (
              <div className="mt-8 space-y-3">
                <p role="alert" className="text-body">
                  {t("mismatch", { signedin: principal.email })}
                </p>
                <Button
                  href={`/auth/logout?returnTo=${encodeURIComponent(absoluteInviteUrl)}`}
                  variant="outline"
                  className="w-full"
                >
                  {t("signOut")}
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="mt-5 text-body text-dark-muted">{unavailableCopy}</p>
        )}
      </Card>
    </main>
  );
}
