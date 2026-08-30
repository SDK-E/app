import { UserActionForm } from "@platform/portal-shell/components/portal/UserActionForm";
import { fieldClass } from "@platform/portal-shell/components/portal/users/styles";
import { regenerateAccessCodeAction } from "@platform/portal-staff/app/users/access-request-actions";
import { inviteClientAction } from "@platform/portal-staff/app/users/actions";
import { Card } from "@platform/ui/Card";
import { getTranslations } from "next-intl/server";

export async function ClientInviteCards({
  locale,
  companyId,
  accessCode,
  canGrantAdministrator,
}: {
  locale: string;
  companyId: string;
  accessCode: null | string;
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
              <input
                className={`${fieldClass} mt-2`}
                name="email"
                type="email"
                required
              />
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
                  <option
                    key={role}
                    value={role}
                  >
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
              <input
                type="hidden"
                name="companyId"
                value={companyId}
              />
            </UserActionForm>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
