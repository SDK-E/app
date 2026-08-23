"use client";

import { Building2, FileText, LayoutDashboard, Mail, Target, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { resolveActiveCompanyId } from "@sdk-e/portal-shell/lib/navigation";
import type { AssignedPrincipal, ClientMembership } from "@sdk-e/types";

interface AppNavLabels {
  dashboard: string;
  requests: string;
  operations: string;
  companies: string;
  team: string;
  users: string;
  opportunities: string;
  invitations: string;
}

interface AppNavLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

export function AppNav({
  locale,
  principal,
  labels,
  collapsed = false,
}: {
  locale: string;
  principal: AssignedPrincipal;
  labels: AppNavLabels;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  if (principal.kind === "sdk-staff") {
    const links: AppNavLink[] = [
      { href: `/${locale}/app`, label: labels.operations, icon: LayoutDashboard },
      { href: `/${locale}/app/companies`, label: labels.companies, icon: Building2 },
    ];
    if (principal.role === "ADMIN")
      links.push({ href: `/${locale}/app/users`, label: labels.users, icon: Users });
    return <NavLinks links={links} collapsed={collapsed} />;
  }
  if (principal.kind === "provider") {
    const links: AppNavLink[] = [
      { href: `/${locale}/app/opportunities`, label: labels.opportunities, icon: Target },
      {
        href: `/${locale}/app/opportunities/invitations`,
        label: labels.invitations,
        icon: Mail,
      },
    ];
    return <NavLinks links={links} collapsed={collapsed} />;
  }
  if (principal.kind !== "client") return null;
  const activeCompanyId = resolveActiveCompanyId(pathname);
  const memberships = principal.memberships;
  const active =
    memberships.find((membership) => membership.companyId === activeCompanyId) ??
    memberships[0] ??
    null;
  const links: AppNavLink[] = [];
  if (active) {
    links.push(
      {
        href: `/${locale}/app/companies/${active.companyId}`,
        label: labels.dashboard,
        icon: LayoutDashboard,
      },
      {
        href: `/${locale}/app/companies/${active.companyId}/requests`,
        label: labels.requests,
        icon: FileText,
      }
    );
    if (["OWNER", "ADMINISTRATOR"].includes(active.role))
      links.push({
        href: `/${locale}/app/companies/${active.companyId}/users`,
        label: labels.team,
        icon: Users,
      });
  }
  return (
    <>
      {memberships.length > 1 ? (
        <div
          className={`flex flex-col gap-0.5 border-t border-dark-deep px-3 py-2 ${
            collapsed ? "lg:hidden" : ""
          }`}
        >
          {memberships.map((membership) => (
            <CompanyLink
              key={membership.companyId}
              locale={locale}
              membership={membership}
              active={membership.companyId === active?.companyId}
              label={membership.companyName}
            />
          ))}
        </div>
      ) : null}
      <NavLinks links={links} collapsed={collapsed} />
    </>
  );
}

function NavLinks({ links, collapsed }: { links: AppNavLink[]; collapsed?: boolean }) {
  return (
    <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          {...(collapsed ? { title: link.label } : {})}
          className={`flex min-h-11 items-center gap-3 whitespace-nowrap rounded-nav px-4 py-3 text-label font-extrabold uppercase tracking-eyebrow text-light transition-colors hover:bg-dark-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
            collapsed ? "lg:justify-center lg:gap-0 lg:px-0" : ""
          }`}
        >
          <link.icon className="h-4 w-4 shrink-0" aria-hidden />
          <span className={collapsed ? "lg:hidden" : ""}>{link.label}</span>
        </Link>
      ))}
    </div>
  );
}

function CompanyLink({
  locale,
  membership,
  active,
  label,
}: {
  locale: string;
  membership: ClientMembership;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={`/${locale}/app/companies/${membership.companyId}`}
      aria-current={active ? "page" : undefined}
      className={`block truncate px-1 py-1.5 text-body ${
        active ? "font-semibold text-brand" : "text-fog hover:text-light"
      }`}
    >
      {label}
    </Link>
  );
}
