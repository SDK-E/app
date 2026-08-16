import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { acceptInvitationAction } from "@/app/[locale]/invite/[token]/actions";
import { InvitationAcceptForm } from "@/components/portal/InvitationAcceptForm";
import { Card } from "@/components/ui/Card";
import { getCurrentPrincipal } from "@/lib/identity";
import { getInvitationPreview } from "@/lib/user-management";

export const metadata: Metadata = { title: "Invitation | SDK Enterprises", robots: { index: false, follow: false } };

export default async function InvitationPage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  const principal = await getCurrentPrincipal();
  if (!principal) redirect(`/${locale}/login?returnTo=${encodeURIComponent(`/${locale}/invite/${token}`)}`);
  const [t, invitation] = await Promise.all([getTranslations({ locale, namespace: "portal.invitation" }), getInvitationPreview(token)]);
  const available = invitation && !invitation.acceptedAt && !invitation.revokedAt && invitation.expiresAt > new Date();
  return <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12"><Card className="w-full max-w-xl"><p className="text-label font-extrabold uppercase tracking-eyebrow text-muted-foreground">SDK Enterprises</p><h1 className="mt-4 text-[32px] font-extrabold md:text-h1">{available ? t("title") : t("unavailableTitle")}</h1>{available ? <><p className="mt-5 text-body text-muted-foreground">{t("intro", { destination: invitation.company?.name ?? "SDK Enterprises", role: (invitation.clientRole ?? invitation.sdkStaffRole ?? "member").replaceAll("_", " ").toLowerCase() })}</p><p className="mt-3 text-body text-muted-foreground">{t("email", { email: invitation.email })}</p><InvitationAcceptForm action={acceptInvitationAction.bind(null, locale, token)} label={t("accept")} /></> : <p className="mt-5 text-body text-muted-foreground">{t("unavailableBody")}</p>}</Card></main>;
}
