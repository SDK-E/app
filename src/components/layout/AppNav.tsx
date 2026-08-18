"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { resolveActiveCompanyId } from "@/lib/app/navigation";
import type { AssignedPrincipal, ClientMembership } from "@/types";

interface AppNavLabels {
  dashboard: string;
  requests: string;
  operations: string;
  companies: string;
  team: string;
  users: string;
}

export function AppNav({
  locale,
  principal,
  labels,
}: {
  locale: string;
  principal: AssignedPrincipal;
  labels: AppNavLabels;
}) {
  const pathname = usePathname();
  if (principal.kind === "sdk-staff") {
    const links = [
      {
        href: `/${locale}/app`,
        label: labels.operations,
      },
      {
        href: `/${locale}/app/companies`,
        label: labels.companies,
      },
    ];
    if (principal.role === "ADMIN")
      links.push({ href: `/${locale}/app/users`, label: labels.users });
    return (
      <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block min-h-11 whitespace-nowrap rounded-nav px-4 py-3 text-label font-extrabold uppercase tracking-eyebrow text-light transition-colors hover:bg-[#2d4b28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {link.label}
          </Link>
        ))}
      </div>
    );
  }
  if (principal.kind !== "client") return null;
  const activeCompanyId = resolveActiveCompanyId(pathname);
  const memberships = principal.memberships;
  const active =
    memberships.find((membership) => membership.companyId === activeCompanyId) ??
    memberships[0] ??
    null;
  const links: Array<{ href: string; label: string }> = [];
  if (active) {
    links.push(
      { href: `/${locale}/app/companies/${active.companyId}`, label: labels.dashboard },
      { href: `/${locale}/app/companies/${active.companyId}/requests`, label: labels.requests }
    );
    if (["OWNER", "ADMINISTRATOR"].includes(active.role))
      links.push({
        href: `/${locale}/app/companies/${active.companyId}/users`,
        label: labels.team,
      });
  }
  return (
    <>
      {memberships.length > 1 ? (
        <div className="flex flex-col gap-0.5 border-t border-[#2d4b28] px-3 py-2">
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
      <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block min-h-11 whitespace-nowrap rounded-nav px-4 py-3 text-label font-extrabold uppercase tracking-eyebrow text-light transition-colors hover:bg-[#2d4b28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </>
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
      className={`block px-1 py-1.5 text-body ${
        active ? "font-semibold text-brand" : "text-fog hover:text-light"
      }`}
    >
      {label}
    </Link>
  );
}
