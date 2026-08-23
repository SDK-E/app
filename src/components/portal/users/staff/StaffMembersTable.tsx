import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { PaginationNav } from "@/components/portal/users/PaginationNav";
import { SortHeader } from "@/components/portal/users/SortHeader";
import { Badge } from "@/components/ui/Badge";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import { usersListHref, type UsersListQuery } from "@/lib/users/list-links";
import type { StaffMemberRow } from "@/lib/users";

export async function StaffMembersTable({
  locale,
  rows,
  nextCursor,
  prevCursor,
  basePath,
  query,
}: {
  locale: string;
  rows: StaffMemberRow[];
  nextCursor: string | null;
  prevCursor: string | null;
  basePath: string;
  query: UsersListQuery;
}) {
  const t = await getTranslations({ locale, namespace: "portal.users" });
  const sortHref = (field: string) => {
    const nextDir = query.sort === field && query.dir === "asc" ? "desc" : "asc";
    return usersListHref(basePath, { ...query, sort: field, dir: nextDir });
  };

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
            <TH>{t("colCompanies")}</TH>
            <TH>{t("colStatus")}</TH>
            <SortHeader
              label={t("colJoined")}
              field="created"
              activeSort={query.sort}
              activeDir={query.dir}
              nextHref={sortHref("created")}
            />
            <TH>{""}</TH>
          </TR>
        </THead>
        <TBody>
          {rows.map((row) => (
            <TR key={row.id}>
              <TD>
                <span className="font-semibold">{row.name}</span>
                {row.sdkStaffRole ? (
                  <Badge tone="live" className="ml-2">
                    {`SDK ${row.sdkStaffRole}`}
                  </Badge>
                ) : null}
              </TD>
              <TD>{row.email}</TD>
              <TD>
                {row.memberships.length
                  ? row.memberships.map((membership) => membership.company.name).join(", ")
                  : t("unassigned")}
              </TD>
              <TD>
                <Badge tone={row.isActive ? "live" : "neutral"}>
                  {row.isActive ? t("active") : t("inactive")}
                </Badge>
              </TD>
              <TD>
                {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(row.createdAt)}
              </TD>
              <TD>
                <Link
                  href={`/${locale}/app/users/${row.id}`}
                  className="text-label font-extrabold uppercase tracking-eyebrow underline-offset-4 hover:underline"
                >
                  {t("manage")}
                </Link>
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
