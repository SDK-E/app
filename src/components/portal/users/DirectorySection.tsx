import { getTranslations } from "next-intl/server";

import {
  removeMembershipAction,
  updateMembershipAction,
  updateStaffAction,
} from "@/app/[locale]/(app)/app/users/membership-actions";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { UserActionForm } from "@/components/portal/UserActionForm";
import { fieldClass } from "@/components/portal/users/styles";
import type { UserManagementData } from "@/lib/users";

export async function DirectorySection({
  locale,
  companyId,
  data,
  clientRoles,
}: {
  locale: string;
  companyId?: string | null;
  data: UserManagementData;
  clientRoles: string[];
}) {
  const t = await getTranslations({ locale, namespace: "portal.users" });
  return (
    <div className="mt-12">
      <h2 className="text-h3 font-extrabold">
        {data.kind === "client" ? t("team") : t("directory")}
      </h2>
      <div className="mt-5 space-y-4">
        {data.kind === "client"
          ? data.memberships.map((membership) => (
              <Card
                key={membership.id}
                className="grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
              >
                <div>
                  <p className="text-body font-semibold">{membership.user.name}</p>
                  <p className="text-body">{membership.user.email}</p>
                </div>
                <UserActionForm
                  action={updateMembershipAction.bind(null, locale, companyId ?? null)}
                  label={t("updateRole")}
                >
                  <input type="hidden" name="membershipId" value={membership.id} />
                  <select
                    key={membership.role}
                    className={fieldClass}
                    name="role"
                    defaultValue={membership.role}
                  >
                    {membership.role === "OWNER" ? (
                      <option value="OWNER">OWNER</option>
                    ) : (
                      clientRoles.map((role) => (
                        <option key={role} value={role}>
                          {role.replaceAll("_", " ")}
                        </option>
                      ))
                    )}
                  </select>
                </UserActionForm>
                <UserActionForm
                  action={removeMembershipAction.bind(null, locale, companyId ?? null)}
                  label={t("remove")}
                  variant="destructive"
                >
                  <input type="hidden" name="membershipId" value={membership.id} />
                </UserActionForm>
              </Card>
            ))
          : data.users.map((user) => (
              <Card key={user.id} className="grid gap-5 xl:grid-cols-[1.2fr_1fr_1fr]">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-body font-semibold">{user.name}</p>
                    <Badge tone={user.isActive ? "live" : "neutral"}>
                      {user.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-body">{user.email}</p>
                  <p className="mt-2 text-micro uppercase tracking-eyebrow">
                    {user.memberships[0]?.company.name ??
                      (user.sdkStaffRole ? "SDK Enterprises" : t("unassigned"))}
                  </p>
                </div>
                {user.memberships[0] ? (
                  <>
                    <UserActionForm
                      action={updateMembershipAction.bind(null, locale, companyId ?? null)}
                      label={t("updateRole")}
                    >
                      <input type="hidden" name="membershipId" value={user.memberships[0].id} />
                      <select
                        key={user.memberships[0].role}
                        className={fieldClass}
                        name="role"
                        defaultValue={user.memberships[0].role}
                      >
                        {user.memberships[0].role === "OWNER" ? (
                          <option value="OWNER">OWNER</option>
                        ) : (
                          clientRoles.map((role) => (
                            <option key={role} value={role}>
                              {role.replaceAll("_", " ")}
                            </option>
                          ))
                        )}
                      </select>
                    </UserActionForm>
                    <UserActionForm
                      action={removeMembershipAction.bind(null, locale, companyId ?? null)}
                      label={t("remove")}
                      variant="destructive"
                    >
                      <input type="hidden" name="membershipId" value={user.memberships[0].id} />
                    </UserActionForm>
                  </>
                ) : user.sdkStaffRole ? (
                  <>
                    <UserActionForm
                      action={updateStaffAction.bind(null, locale)}
                      label={t("updateRole")}
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        key={user.sdkStaffRole}
                        className={fieldClass}
                        name="role"
                        defaultValue={user.sdkStaffRole}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="DELIVERY">DELIVERY</option>
                        <option value="FINANCE">FINANCE</option>
                      </select>
                    </UserActionForm>
                    <UserActionForm
                      action={updateStaffAction.bind(null, locale)}
                      label={user.isActive ? t("deactivate") : t("activate")}
                      variant={user.isActive ? "destructive" : "outline"}
                    >
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="isActive" value={String(!user.isActive)} />
                    </UserActionForm>
                  </>
                ) : (
                  <p className="text-body">{t("inviteToAssign")}</p>
                )}
              </Card>
            ))}
      </div>
    </div>
  );
}
