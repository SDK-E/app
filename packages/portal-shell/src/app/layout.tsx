import { getCurrentPrincipal } from "@platform/auth/identity";
import { AccessPending } from "@platform/portal-shell/AccessPending";
import { AppShell } from "@platform/portal-shell/AppShell";
import { redirect } from "next/navigation";
import { z } from "zod";

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
    const target = encodeURIComponent(`/${locale}/app`);
    redirect(`/${locale}/login?returnTo=${target}`);
  }

  if (principal.kind === "unassigned") {
    return (
      <AccessPending
        principal={principal}
        locale={locale}
      />
    );
  }

  return (
    <AppShell
      locale={locale}
      principal={principal}
    >
      {children}
    </AppShell>
  );
}
