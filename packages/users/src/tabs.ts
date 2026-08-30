export type UsersTab = "invitations" | "members" | "requests";

export const usersTabs = ["members", "invitations", "requests"] as const;

export interface TabCounts {
  members: number;
  invitations: number;
  requests: number;
}

export function isUsersTab(value: string | undefined): value is UsersTab {
  return !!value && (usersTabs as readonly string[]).includes(value);
}
