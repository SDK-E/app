import { getTranslations } from "next-intl/server";

import { inviteClientAction } from "@/app/[locale]/(app)/app/users/actions";
import { regenerateAccessCodeAction } from "@/app/[locale]/(app)/app/users/access-request-actions";
import { Card } from "@/components/ui/Card";
import { UserActionForm } from "@/components/portal/UserActionForm";
import { fieldClass } from "@/components/portal/users/styles";

export async function ClientInviteCards({
  locale,
  companyId,
  accessCode,
  canGrantAdministrator,
}: {
  locale: string;
  companyId: string;
  accessCode: string | null;
  canGrantAdministrator: boolean;
}) {
  const t = await getTranslations({ locale, namespace: "portal.users" });
  const roles = canGrantAdministrator
    ? ["ADMINISTRATOR", "PROJECT_MEMBER", "BILLING", "VIEWER"]
    : ["PROJECT_MEMBER", "BILLING", "VIEWER"];

  return (
    <div className="mt-10 grid gap-6 xl:grid-cols-2">
      <Card>
        <h2 className="text-h3 font-extrabold">{t("inviteClient")}</h2>
        <div className="mt-5">
          <UserActionForm
            action={inviteClientAction.bind(null, locale, companyId)}
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
                defaultValue="PROJECT_MEMBER"
                required
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          </UserActionForm>
        </div>
      </Card>

      {accessCode ? (
        <Card>
          <h2 className="text-h3 font-extrabold">{t("accessCode")}</h2>
          <p className="mt-2 text-body font-mono uppercase tracking-widest">{accessCode}</p>
          <p className="mt-2 text-body">{t("accessCodeHelp")}</p>
          <div className="mt-4">
            <UserActionForm
              action={regenerateAccessCodeAction.bind(null, locale, companyId)}
              label={t("regenerate")}
              confirmLabel={t("confirmRegenerate")}
            >
              <input type="hidden" name="companyId" value={companyId} />
            </UserActionForm>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
