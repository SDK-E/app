import { getTranslations } from "next-intl/server";

import {
  approveAccessRequestAction,
  declineAccessRequestAction,
} from "@/app/[locale]/(app)/app/users/access-request-actions";
import { PaginationNav } from "@/components/portal/users/PaginationNav";
import { SortHeader } from "@/components/portal/users/SortHeader";
import { UserActionForm } from "@/components/portal/UserActionForm";
import { TBody, TD, TH, THead, TR, Table } from "@sdk-e/ui/Table";
import { fieldClass } from "@/components/portal/users/styles";
import { usersListHref, type UsersListQuery } from "@sdk-e/users/list-links";
import type { StaffRequestRow } from "@sdk-e/users";

const assignableRoles = ["ADMINISTRATOR", "PROJECT_MEMBER", "BILLING", "VIEWER"];

export async function StaffRequestsTable({
  locale,
  rows,
  nextCursor,
  prevCursor,
  basePath,
  query,
}: {
  locale: string;
  rows: StaffRequestRow[];
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
            <TH>{t("colCompany")}</TH>
            <TH>{t("colRequestedRole")}</TH>
            <SortHeader
              label={t("colRequested")}
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
                <span className="font-semibold">{row.user.name}</span>
              </TD>
              <TD>{row.user.email}</TD>
              <TD>{row.company.name}</TD>
              <TD>{row.requestedRole.replaceAll("_", " ")}</TD>
              <TD>
                {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(row.createdAt)}
              </TD>
              <TD>
                <div className="flex items-start gap-2">
                  <UserActionForm
                    action={approveAccessRequestAction.bind(null, locale, null)}
                    label={t("approve")}
                    variant="default"
                  >
                    <input type="hidden" name="requestId" value={row.id} />
                    <select className={fieldClass} name="role" defaultValue="VIEWER">
                      {assignableRoles.map((role) => (
                        <option key={role} value={role}>
                          {role.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  </UserActionForm>
                  <UserActionForm
                    action={declineAccessRequestAction.bind(null, locale, null)}
                    label={t("decline")}
                    confirmLabel={t("confirmDecline")}
                    variant="destructive"
                  >
                    <input type="hidden" name="requestId" value={row.id} />
                  </UserActionForm>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
      {!rows.length ? (
        <p className="mt-4 text-body text-muted-foreground">{t("requestsEmpty")}</p>
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
