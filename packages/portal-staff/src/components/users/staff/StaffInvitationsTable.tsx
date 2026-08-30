import type { StaffInvitationRow } from "@platform/users";

import { UserActionForm } from "@platform/portal-shell/components/portal/UserActionForm";
import { PaginationNav } from "@platform/portal-shell/components/portal/users/PaginationNav";
import { SortHeader } from "@platform/portal-shell/components/portal/users/SortHeader";
import {
  resendInvitationAction,
  revokeInvitationAction,
} from "@platform/portal-staff/app/users/actions";
import { Badge } from "@platform/ui/Badge";
import { Table, TBody, TD, TH, THead, TR } from "@platform/ui/Table";
import { usersListHref, type UsersListQuery } from "@platform/users/list-links";
import { getTranslations } from "next-intl/server";

export async function StaffInvitationsTable({
  locale,
  rows,
  nextCursor,
  prevCursor,
  basePath,
  query,
}: {
  locale: string;
  rows: StaffInvitationRow[];
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
  const boundLocale = locale;

  return (
    <div>
      <Table>
        <THead>
          <TR>
            <SortHeader
              label={t("colEmail")}
              field="email"
              activeSort={query.sort}
              activeDir={query.dir}
              nextHref={sortHref("email")}
            />
            <TH>{t("colRole")}</TH>
            <TH>{t("colCompany")}</TH>
            <TH>{t("colDelivery")}</TH>
            <TH>{t("colExpires")}</TH>
            <TH>{""}</TH>
          </TR>
        </THead>
        <TBody>
          {rows.map((row) => (
            <TR key={row.id}>
              <TD>
                <span className="font-semibold">{row.email}</span>
              </TD>
              <TD>
                {(row.clientRole ?? row.sdkStaffRole ?? "—").replaceAll("_", " ")}
                <Badge
                  tone="neutral"
                  className="ml-2"
                >
                  {row.kind === "SDK_STAFF" ? "SDK" : t("clientKind")}
                </Badge>
              </TD>
              <TD>{row.company?.name ?? "—"}</TD>
              <TD>
                <Badge tone={row.deliveryStatus === "SENT" ? "live" : "review"}>
                  {row.deliveryStatus}
                </Badge>
              </TD>
              <TD>
                {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(row.expiresAt)}
              </TD>
              <TD>
                <div className="flex items-start gap-2">
                  <UserActionForm
                    action={resendInvitationAction.bind(null, boundLocale, null)}
                    label={t("resend")}
                  >
                    <input
                      type="hidden"
                      name="invitationId"
                      value={row.id}
                    />
                  </UserActionForm>
                  <UserActionForm
                    action={revokeInvitationAction.bind(null, boundLocale, null)}
                    label={t("revoke")}
                    confirmLabel={t("confirmRevoke")}
                    variant="destructive"
                  >
                    <input
                      type="hidden"
                      name="invitationId"
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
        <p className="mt-4 text-body text-muted-foreground">{t("invitationsEmpty")}</p>
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
