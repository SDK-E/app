export type UsersTab = "members" | "invitations" | "requests";

export const usersTabs = ["members", "invitations", "requests"] as const;

export function isUsersTab(value: string | undefined): value is UsersTab {
  return !!value && (usersTabs as readonly string[]).includes(value);
}

export interface TabCounts {
  members: number;
  invitations: number;
  requests: number;
}
