import { redirect } from "next/navigation";
import { z } from "zod";

import { AccessPending } from "@/components/layout/AccessPending";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentPrincipal } from "@sdk-e/auth/identity";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<unknown>;
}>) {
  const { locale } = z.object({ locale: z.string() }).parse(await params);
  const principal = await getCurrentPrincipal();

  if (!principal) {
    redirect(`/${locale}/login?returnTo=${encodeURIComponent(`/${locale}/app`)}`);
  }

  if (principal.kind === "unassigned") {
    return <AccessPending principal={principal} locale={locale} />;
  }

  return (
    <AppShell locale={locale} principal={principal}>
      {children}
    </AppShell>
  );
}
