import type { StaffRequestRow } from "@platform/users";

import { UserActionForm } from "@platform/portal-shell/components/portal/UserActionForm";
import { PaginationNav } from "@platform/portal-shell/components/portal/users/PaginationNav";
import { SortHeader } from "@platform/portal-shell/components/portal/users/SortHeader";
import { fieldClass } from "@platform/portal-shell/components/portal/users/styles";
import {
  approveAccessRequestAction,
  declineAccessRequestAction,
} from "@platform/portal-staff/app/users/access-request-actions";
import { Table, TBody, TD, TH, THead, TR } from "@platform/ui/Table";
import { usersListHref, type UsersListQuery } from "@platform/users/list-links";
import { getTranslations } from "next-intl/server";

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
  nextCursor: null | string;
  prevCursor: null | string;
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
                    <input
                      type="hidden"
                      name="requestId"
                      value={row.id}
                    />
                    <select
                      className={fieldClass}
                      name="role"
                      defaultValue="VIEWER"
                    >
                      {assignableRoles.map((role) => (
                        <option
                          key={role}
                          value={role}
                        >
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
                    <input
                      type="hidden"
                      name="requestId"
                      value={row.id}
                    />
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
