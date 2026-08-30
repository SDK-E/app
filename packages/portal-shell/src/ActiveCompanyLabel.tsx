"use client";

import type { AssignedPrincipal } from "@platform/types";

import { resolveActiveCompanyId } from "@platform/portal-shell/lib/navigation";
import { usePathname } from "next/navigation";

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
    (membership) => membership.companyId === activeCompanyId,
  );
  return <>{active ? active.companyName : fallback}</>;
}
