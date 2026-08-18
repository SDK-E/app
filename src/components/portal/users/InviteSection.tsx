import { getTranslations } from "next-intl/server";

import { inviteClientAction, inviteStaffAction } from "@/app/[locale]/(app)/app/users/actions";
import { regenerateAccessCodeAction } from "@/app/[locale]/(app)/app/users/access-request-actions";
import { getClientMembership } from "@/lib/auth/authorization";
import { Card } from "@/components/ui/Card";
import { UserActionForm } from "@/components/portal/UserActionForm";
import { fieldClass } from "@/components/portal/users/styles";
import type { UserManagementData } from "@/lib/users";
import type { AssignedPrincipal } from "@/types";

export async function InviteSection({
  locale,
  companyId,
  data,
  principal,
  clientRoles,
}: {
  locale: string;
  companyId?: string | null;
  data: UserManagementData;
  principal: AssignedPrincipal;
  clientRoles: string[];
}) {
  const t = await getTranslations({ locale, namespace: "portal.users" });
  const myRole =
    principal.kind === "client" && companyId
      ? getClientMembership(principal, companyId).role
      : null;
  return (
    <>
      <Card>
        <h2 className="text-h3 font-extrabold">{t("inviteClient")}</h2>
        <div className="mt-5">
          <UserActionForm
            action={inviteClientAction.bind(null, locale, companyId ?? null)}
            label={t("sendInvitation")}
            variant="default"
          >
            <label className="block text-label font-extrabold uppercase tracking-eyebrow">
              {t("email")}
              <input className={`${fieldClass} mt-2`} name="email" type="email" required />
            </label>
            {data.kind === "staff" ? (
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                {t("company")}
                <select className={`${fieldClass} mt-2`} name="companyId" required>
                  {data.companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="block text-label font-extrabold uppercase tracking-eyebrow">
              {t("role")}
              <select
                className={`${fieldClass} mt-2`}
                name="role"
                defaultValue="PROJECT_MEMBER"
                required
              >
                {clientRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          </UserActionForm>
        </div>
      </Card>
      {data.kind === "staff" ? (
        <Card>
          <h2 className="text-h3 font-extrabold">{t("inviteStaff")}</h2>
          <div className="mt-5">
            <UserActionForm
              action={inviteStaffAction.bind(null, locale)}
              label={t("sendInvitation")}
              variant="default"
            >
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                {t("email")}
                <input className={`${fieldClass} mt-2`} name="email" type="email" required />
              </label>
              <label className="block text-label font-extrabold uppercase tracking-eyebrow">
                {t("role")}
                <select
                  className={`${fieldClass} mt-2`}
                  name="role"
                  defaultValue="DELIVERY"
                  required
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="DELIVERY">DELIVERY</option>
                  <option value="FINANCE">FINANCE</option>
                </select>
              </label>
            </UserActionForm>
          </div>
        </Card>
      ) : null}
      {data.kind === "client" && myRole === "OWNER" && data.company ? (
        <Card>
          <h2 className="text-h3 font-extrabold">{t("accessCode")}</h2>
          <p className="mt-2 text-body font-mono uppercase tracking-widest">
            {data.company.accessCode}
          </p>
          <p className="mt-2 text-body text-muted-foreground">{t("accessCodeHelp")}</p>
          <div className="mt-4">
            <UserActionForm
              action={regenerateAccessCodeAction.bind(null, locale, companyId ?? null)}
              label={t("regenerate")}
            >
              <input type="hidden" name="companyId" value={data.company.id} />
            </UserActionForm>
          </div>
        </Card>
      ) : data.kind === "staff" ? (
        <Card>
          <h2 className="text-h3 font-extrabold">{t("accessCode")}</h2>
          <p className="mt-2 text-body text-muted-foreground">{t("accessCodeHelp")}</p>
          <div className="mt-4">
            <UserActionForm
              action={regenerateAccessCodeAction.bind(null, locale, null)}
              label={t("regenerate")}
            >
              <select className={fieldClass} name="companyId" required>
                {data.companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </UserActionForm>
          </div>
        </Card>
      ) : null}
    </>
  );
}
