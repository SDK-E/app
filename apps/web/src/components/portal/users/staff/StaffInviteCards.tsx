import { getTranslations } from "next-intl/server";

import { inviteClientAction, inviteStaffAction } from "@/app/[locale]/(app)/app/users/actions";
import { regenerateAccessCodeAction } from "@/app/[locale]/(app)/app/users/access-request-actions";
import { Card } from "@sdk-e/ui/Card";
import { UserActionForm } from "@/components/portal/UserActionForm";
import { fieldClass } from "@/components/portal/users/styles";

const clientRoles = ["ADMINISTRATOR", "PROJECT_MEMBER", "BILLING", "VIEWER"];
const staffRoles = ["ADMIN", "DELIVERY", "FINANCE"];

export async function StaffInviteCards({
  locale,
  companies,
}: {
  locale: string;
  companies: { id: string; name: string }[];
}) {
  const t = await getTranslations({ locale, namespace: "portal.users" });
  return (
    <div className="mt-10 grid gap-6 xl:grid-cols-3">
      <Card>
        <h2 className="text-h3 font-extrabold">{t("inviteClient")}</h2>
        <div className="mt-5">
          <UserActionForm
            action={inviteClientAction.bind(null, locale, null)}
            label={t("sendInvitation")}
            variant="default"
          >
            <label className="block text-label font-extrabold uppercase tracking-eyebrow">
              {t("email")}
              <input className={`${fieldClass} mt-2`} name="email" type="email" required />
            </label>
            <label className="block text-label font-extrabold uppercase tracking-eyebrow">
              {t("company")}
              <select className={`${fieldClass} mt-2`} name="companyId" required>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>
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
              <select className={`${fieldClass} mt-2`} name="role" defaultValue="DELIVERY" required>
                {staffRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </UserActionForm>
        </div>
      </Card>

      <Card>
        <h2 className="text-h3 font-extrabold">{t("accessCode")}</h2>
        <p className="mt-2 text-body">{t("accessCodeHelp")}</p>
        <div className="mt-4">
          <UserActionForm
            action={regenerateAccessCodeAction.bind(null, locale, null)}
            label={t("regenerate")}
            confirmLabel={t("confirmRegenerate")}
          >
            <select className={fieldClass} name="companyId" required>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </UserActionForm>
        </div>
      </Card>
    </div>
  );
}
