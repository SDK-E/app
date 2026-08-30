import { getTranslations } from "next-intl/server";

import { updateStaffAction } from "@sdk-e/portal-staff/app/users/membership-actions";
import {
  setAccountActiveAction,
  updateUserNameAction,
} from "@sdk-e/portal-staff/app/users/assignment-actions";
import { Card } from "@sdk-e/ui/Card";
import { Badge } from "@sdk-e/ui/Badge";
import { UserActionForm } from "@sdk-e/portal-shell/components/portal/UserActionForm";
import { fieldClass } from "@sdk-e/portal-shell/components/portal/users/styles";
import type { UserDetailView } from "@sdk-e/users";

const staffRoles = ["ADMIN", "DELIVERY", "FINANCE"];

export async function UserIdentityCard({
  locale,
  detail,
}: {
  locale: string;
  detail: UserDetailView;
}) {
  const t = await getTranslations({ locale, namespace: "portal.users" });
  const { user } = detail;
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-label font-extrabold uppercase tracking-eyebrow">
            {t("identityTitle")}
          </p>
          <h2 className="mt-2 text-h3 font-extrabold">{user.name}</h2>
          <p className="mt-1 text-body">{user.email}</p>
          <div className="mt-3 flex items-center gap-2">
            <Badge tone={user.isActive ? "live" : "neutral"}>
              {user.isActive ? t("active") : t("inactive")}
            </Badge>
            {user.sdkStaffRole ? <Badge tone="review">{`SDK ${user.sdkStaffRole}`}</Badge> : null}
          </div>
          {user.lastLoginAt ? (
            <p className="mt-3 text-micro uppercase tracking-eyebrow text-muted-foreground">
              {t("lastLogin", {
                date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                  user.lastLoginAt
                ),
              })}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <UserActionForm
            action={updateUserNameAction.bind(null, locale)}
            label={t("saveName")}
            variant="outline"
          >
            <input type="hidden" name="userId" value={user.id} />
            <label className="block text-label font-extrabold uppercase tracking-eyebrow">
              {t("colName")}
              <input
                className={`${fieldClass} mt-2`}
                name="name"
                defaultValue={user.name}
                required
              />
            </label>
          </UserActionForm>

          <UserActionForm
            action={setAccountActiveAction.bind(null, locale)}
            label={user.isActive ? t("deactivate") : t("activate")}
            confirmLabel={user.isActive ? t("confirmDeactivate") : undefined}
            variant={user.isActive ? "destructive" : "default"}
          >
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="isActive" value={String(!user.isActive)} />
          </UserActionForm>

          {user.sdkStaffRole ? (
            <UserActionForm
              action={updateStaffAction.bind(null, locale)}
              label={t("updateRole")}
              variant="outline"
            >
              <input type="hidden" name="userId" value={user.id} />
              <select
                key={user.sdkStaffRole}
                className={fieldClass}
                name="role"
                defaultValue={user.sdkStaffRole}
              >
                {staffRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </UserActionForm>
          ) : null}

          <p className="max-w-xs text-micro uppercase tracking-eyebrow text-muted-foreground">
            {t("identitySyncNote")}
          </p>
        </div>
      </div>
    </Card>
  );
}
