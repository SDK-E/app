"use client";

import { usePathname } from "next/navigation";

import { resolveActiveCompanyId } from "@sdk-e/portal-shell/lib/navigation";
import type { AssignedPrincipal } from "@sdk-e/types";

export function ActiveCompanyLabel({
  principal,
  fallback,
}: {
  principal: AssignedPrincipal;
  fallback: string;
}) {
  const pathname = usePathname();
  if (principal.kind !== "client") return <>{fallback}</>;
  const activeCompanyId = resolveActiveCompanyId(pathname);
  const active = principal.memberships.find(
    (membership) => membership.companyId === activeCompanyId
  );
  return <>{active ? active.companyName : fallback}</>;
}
