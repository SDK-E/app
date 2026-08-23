import { getTranslations } from "next-intl/server";

import {
  resendInvitationAction,
  revokeInvitationAction,
} from "@/app/[locale]/(app)/app/users/actions";
import { PaginationNav } from "@/components/portal/users/PaginationNav";
import { SortHeader } from "@/components/portal/users/SortHeader";
import { UserActionForm } from "@/components/portal/UserActionForm";
import { Badge } from "@sdk-e/ui/Badge";
import { TBody, TD, TH, THead, TR, Table } from "@sdk-e/ui/Table";
import { usersListHref, type UsersListQuery } from "@sdk-e/users/list-links";
import type { ClientInvitationRow } from "@sdk-e/users";

export async function ClientInvitationsTable({
  locale,
  companyId,
  rows,
  nextCursor,
  prevCursor,
  basePath,
  query,
}: {
  locale: string;
  companyId: string;
  rows: ClientInvitationRow[];
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
              label={t("colEmail")}
              field="email"
              activeSort={query.sort}
              activeDir={query.dir}
              nextHref={sortHref("email")}
            />
            <TH>{t("colRole")}</TH>
            <TH>{t("colDelivery")}</TH>
            <SortHeader
              label={t("colExpires")}
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
                <span className="font-semibold">{row.email}</span>
              </TD>
              <TD>{(row.clientRole ?? "—").replaceAll("_", " ")}</TD>
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
                    action={resendInvitationAction.bind(null, locale, companyId)}
                    label={t("resend")}
                  >
                    <input type="hidden" name="invitationId" value={row.id} />
                  </UserActionForm>
                  <UserActionForm
                    action={revokeInvitationAction.bind(null, locale, companyId)}
                    label={t("revoke")}
                    confirmLabel={t("confirmRevoke")}
                    variant="destructive"
                  >
                    <input type="hidden" name="invitationId" value={row.id} />
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
