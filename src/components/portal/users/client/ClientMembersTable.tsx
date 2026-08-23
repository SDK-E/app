import { getTranslations } from "next-intl/server";

import {
  removeMembershipAction,
  updateMembershipAction,
} from "@/app/[locale]/(app)/app/users/membership-actions";
import { PaginationNav } from "@/components/portal/users/PaginationNav";
import { SortHeader } from "@/components/portal/users/SortHeader";
import { UserActionForm } from "@/components/portal/UserActionForm";
import { Badge } from "@/components/ui/Badge";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import { fieldClass } from "@/components/portal/users/styles";
import { usersListHref, type UsersListQuery } from "@/lib/users/list-links";
import type { ClientMemberRow } from "@/lib/users";

export async function ClientMembersTable({
  locale,
  companyId,
  rows,
  nextCursor,
  prevCursor,
  basePath,
  query,
  canGrantAdministrator,
}: {
  locale: string;
  companyId: string;
  rows: ClientMemberRow[];
  nextCursor: string | null;
  prevCursor: string | null;
  basePath: string;
  query: UsersListQuery;
  canGrantAdministrator: boolean;
}) {
  const t = await getTranslations({ locale, namespace: "portal.users" });
  const sortHref = (field: string) => {
    const nextDir = query.sort === field && query.dir === "asc" ? "desc" : "asc";
    return usersListHref(basePath, { ...query, sort: field, dir: nextDir });
  };
  const roles = canGrantAdministrator
    ? ["ADMINISTRATOR", "PROJECT_MEMBER", "BILLING", "VIEWER"]
    : ["PROJECT_MEMBER", "BILLING", "VIEWER"];

  return (
    <div>
      <Table>
        <THead>
          <TR>
            <SortHeader
              label={t("colName")}
              field="name"
              activeSort={query.sort}
              activeDir={query.dir}
              nextHref={sortHref("name")}
            />
            <TH>{t("colEmail")}</TH>
            <SortHeader
              label={t("colRole")}
              field="role"
              activeSort={query.sort}
              activeDir={query.dir}
              nextHref={sortHref("role")}
            />
            <TH>{t("colStatus")}</TH>
            <SortHeader
              label={t("colJoined")}
              field="joined"
              activeSort={query.sort}
              activeDir={query.dir}
              nextHref={sortHref("joined")}
            />
            <TH>{""}</TH>
          </TR>
        </THead>
        <TBody>
          {rows.map((row) => (
            <TR key={row.id}>
              <TD>
                <span className="font-semibold">{row.name}</span>
              </TD>
              <TD>{row.email}</TD>
              <TD>
                <UserActionForm
                  action={updateMembershipAction.bind(null, locale, companyId)}
                  label={t("updateRole")}
                >
                  <input type="hidden" name="membershipId" value={row.id} />
                  {row.role === "OWNER" ? (
                    <Badge tone="live">{row.role}</Badge>
                  ) : (
                    <select
                      key={row.role}
                      className={`${fieldClass} min-w-40`}
                      name="role"
                      defaultValue={row.role}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  )}
                </UserActionForm>
              </TD>
              <TD>
                <Badge tone={row.isActive ? "live" : "neutral"}>
                  {row.isActive ? t("active") : t("inactive")}
                </Badge>
              </TD>
              <TD>
                {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(row.joinedAt)}
              </TD>
              <TD>
                {row.role === "OWNER" ? null : (
                  <UserActionForm
                    action={removeMembershipAction.bind(null, locale, companyId)}
                    label={t("remove")}
                    confirmLabel={t("confirmRemove")}
                    variant="destructive"
                  >
                    <input type="hidden" name="membershipId" value={row.id} />
                  </UserActionForm>
                )}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
      {!rows.length ? (
        <p className="mt-4 text-body text-muted-foreground">{t("membersEmpty")}</p>
      ) : null}
      <PaginationNav
        label={t("paginationLabel")}
        nextHref={nextCursor ? usersListHref(basePath, query, { cursor: nextCursor }) : null}
        prevHref={
          query.cursor && prevCursor
            ? usersListHref(basePath, query, { cursor: prevCursor, back: true })
            : null
        }
        prevVisible={!!query.cursor}
      />
    </div>
  );
}
