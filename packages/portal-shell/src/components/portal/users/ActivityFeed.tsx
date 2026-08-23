import { EmptyState } from "@sdk-e/ui/EmptyState";
import type { ActivityRow } from "@sdk-e/users/activity";

function formatDate(locale: string, date: Date) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export async function ActivityFeed({
  locale,
  events,
  labels,
}: {
  locale: string;
  events: ActivityRow[];
  labels: {
    emptyTitle: string;
    emptyDescription?: string;
    roleChanged?: string;
    membershipRemoved?: string;
    membershipAssigned?: string;
    invitationCreated?: string;
    invitationRenewed?: string;
    invitationRevoked?: string;
    invitationAccepted?: string;
    requestApproved?: string;
    requestDeclined?: string;
    activeChanged?: string;
    nameCorrected?: string;
    staffRoleChanged?: string;
    accessCodeRegenerated?: string;
  };
}) {
  if (!events.length) {
    return <EmptyState title={labels.emptyTitle} description={labels.emptyDescription} />;
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex flex-wrap items-baseline justify-between gap-2 rounded-card border border-border bg-card px-4 py-3"
        >
          <p className="text-body">
            <span className="font-semibold">{event.actorName ?? "—"}</span>{" "}
            {describeEvent(event, labels)}{" "}
            {event.toState ? (
              <span className="text-muted-foreground">→ {event.toState}</span>
            ) : null}
          </p>
          <time className="text-micro uppercase tracking-eyebrow text-muted-foreground">
            {formatDate(locale, event.createdAt)}
          </time>
        </li>
      ))}
    </ol>
  );
}

function describeEvent(
  event: ActivityRow,
  labels: {
    roleChanged?: string;
    membershipRemoved?: string;
    membershipAssigned?: string;
    invitationCreated?: string;
    invitationRenewed?: string;
    invitationRevoked?: string;
    invitationAccepted?: string;
    requestApproved?: string;
    requestDeclined?: string;
    activeChanged?: string;
    nameCorrected?: string;
    staffRoleChanged?: string;
    accessCodeRegenerated?: string;
  }
): string {
  switch (event.action) {
    case "membership.role_changed":
      return labels.roleChanged ?? event.action;
    case "membership.removed":
      return labels.membershipRemoved ?? event.action;
    case "membership.assigned":
      return labels.membershipAssigned ?? event.action;
    case "invitation.created":
      return labels.invitationCreated ?? event.action;
    case "invitation.renewed":
      return labels.invitationRenewed ?? event.action;
    case "invitation.revoked":
      return labels.invitationRevoked ?? event.action;
    case "invitation.accepted":
      return labels.invitationAccepted ?? event.action;
    case "access_request.approved":
      return labels.requestApproved ?? event.action;
    case "access_request.declined":
      return labels.requestDeclined ?? event.action;
    case "user.active_changed":
      return labels.activeChanged ?? event.action;
    case "user.name_corrected":
      return labels.nameCorrected ?? event.action;
    case "staff_role.changed":
      return labels.staffRoleChanged ?? event.action;
    case "access_code.regenerated":
      return labels.accessCodeRegenerated ?? event.action;
    default:
      return event.action;
  }
}
