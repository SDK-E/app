import type { SortDir } from "@sdk-e/users/list";
import { isUsersTab, type UsersTab } from "@sdk-e/users/tabs";

export interface UsersListQuery {
  tab: UsersTab;
  q?: string;
  sort?: string;
  dir?: SortDir;
  cursor?: string;
  back?: boolean;
  company?: string;
  status?: string;
}

const raw = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value || undefined;

export function parseUsersListQuery(
  searchParams: Record<string, string | string[] | undefined>,
  fallbackTab: UsersTab = "members"
): UsersListQuery {
  const tabValue = raw(searchParams.tab);
  return {
    tab: isUsersTab(tabValue) ? tabValue : fallbackTab,
    q: raw(searchParams.q),
    sort: raw(searchParams.sort),
    dir: raw(searchParams.dir) === "desc" ? "desc" : "asc",
    cursor: raw(searchParams.cursor),
    back: raw(searchParams.back) === "1",
    company: raw(searchParams.company),
    status: raw(searchParams.status),
  };
}

/** Builds a tab href, preserving search/sort/filters and dropping pagination unless given. */
export function usersListHref(
  basePath: string,
  query: UsersListQuery,
  overrides?: { cursor?: string | null; back?: boolean }
): string {
  const params = new URLSearchParams();
  if (query.tab !== "members") params.set("tab", query.tab);
  if (query.q) params.set("q", query.q);
  if (query.sort) params.set("sort", query.sort);
  if (query.dir === "desc") params.set("dir", "desc");
  if (query.company) params.set("company", query.company);
  if (query.status && query.status !== "all") params.set("status", query.status);
  const cursor = overrides?.cursor !== undefined ? overrides.cursor : null;
  const back = overrides?.back ?? query.back;
  if (cursor) {
    params.set("cursor", cursor);
    if (back) params.set("back", "1");
  }
  const suffix = params.toString();
  return suffix ? `${basePath}?${suffix}` : basePath;
}
