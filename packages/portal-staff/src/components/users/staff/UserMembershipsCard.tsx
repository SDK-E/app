import { getTranslations } from "next-intl/server";

import { assignUserToCompanyAction } from "@sdk-e/portal-staff/app/users/assignment-actions";
import {
  removeMembershipAction,
  updateMembershipAction,
} from "@sdk-e/portal-staff/app/users/membership-actions";
import { Card } from "@sdk-e/ui/Card";
import { Badge } from "@sdk-e/ui/Badge";
import { UserActionForm } from "@sdk-e/portal-shell/components/portal/UserActionForm";
import { fieldClass } from "@sdk-e/portal-shell/components/portal/users/styles";
import type { UserDetailView } from "@sdk-e/users";

const assignableRoles = ["OWNER", "ADMINISTRATOR", "PROJECT_MEMBER", "BILLING", "VIEWER"];
const changeableRoles = ["ADMINISTRATOR", "PROJECT_MEMBER", "BILLING", "VIEWER"];

export async function UserMembershipsCard({
  locale,
  detail,
}: {
  locale: string;
  detail: UserDetailView;
}) {
  const t = await getTranslations({ locale, namespace: "portal.users" });
  const memberCompanyIds = new Set(detail.memberships.map((membership) => membership.company.id));
  const availableCompanies = detail.companies.filter(
    (company) => !memberCompanyIds.has(company.id)
  );

  return (
    <Card>
      <h2 className="text-h3 font-extrabold">{t("membershipsTitle")}</h2>

      <div className="mt-5 space-y-4">
        {detail.memberships.map((membership) => (
          <div
            key={membership.id}
            className="grid gap-4 rounded-card border border-border px-4 py-4 lg:grid-cols-[1.5fr_1fr_1fr] lg:items-end"
          >
            <div>
              <p className="text-body font-semibold">
                {membership.company.name}
                {!membership.company.isActive ? (
                  <Badge tone="neutral" className="ml-2">
                    {t("inactive")}
                  </Badge>
                ) : null}
              </p>
              <p className="mt-1 text-micro uppercase tracking-eyebrow text-muted-foreground">
                {t("joinedOn", {
                  date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                    membership.joinedAt
                  ),
                })}
              </p>
            </div>
            <UserActionForm
              action={updateMembershipAction.bind(null, locale, null)}
              label={t("updateRole")}
            >
              <input type="hidden" name="membershipId" value={membership.id} />
              <select
                key={membership.role}
                className={fieldClass}
                name="role"
                defaultValue={membership.role}
                disabled={membership.role === "OWNER"}
              >
                {membership.role === "OWNER" ? (
                  <option value="OWNER">OWNER</option>
                ) : (
                  changeableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role.replaceAll("_", " ")}
                    </option>
                  ))
                )}
              </select>
            </UserActionForm>
            <UserActionForm
              action={removeMembershipAction.bind(null, locale, null)}
              label={t("remove")}
              confirmLabel={membership.role === "OWNER" ? undefined : t("confirmRemove")}
              variant="destructive"
            >
              <input type="hidden" name="membershipId" value={membership.id} />
            </UserActionForm>
          </div>
        ))}
        {!detail.memberships.length ? (
          <p className="text-body text-muted-foreground">{t("noMemberships")}</p>
        ) : null}
      </div>

      {detail.user.sdkStaffRole ? null : availableCompanies.length ? (
        <div className="mt-6 border-t border-border pt-6">
          <h3 className="text-label font-extrabold uppercase tracking-eyebrow">
            {t("assignTitle")}
          </h3>
          <div className="mt-4 max-w-md">
            <UserActionForm
              action={assignUserToCompanyAction.bind(null, locale)}
              label={t("assign")}
              variant="default"
            >
              <input type="hidden" name="userId" value={detail.user.id} />
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                {t("company")}
                <select className={`${fieldClass} mt-2`} name="companyId" required>
                  {availableCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                {t("role")}
                <select className={`${fieldClass} mt-2`} name="role" defaultValue="PROJECT_MEMBER">
                  {assignableRoles.map((role) => (
                    <option key={role} value={role}>
                      {role.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            </UserActionForm>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
