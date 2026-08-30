import type { SortDir } from "@platform/users/list";

import { isUsersTab, type UsersTab } from "@platform/users/tabs";

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
  fallbackTab: UsersTab = "members",
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
  overrides?: { cursor?: null | string; back?: boolean },
): string {
  const params = new URLSearchParams();
  setOptionalParam(params, "tab", query.tab !== "members" ? query.tab : "");
  setOptionalParam(params, "q", query.q);
  setOptionalParam(params, "sort", query.sort);
  setIfDesc(params, "dir", query.dir);
  setOptionalParam(params, "company", query.company);
  setFilterParam(params, "status", query.status);

  const cursor = overrides?.cursor !== undefined ? overrides.cursor : null;
  const back = overrides?.back ?? query.back;
  if (cursor) {
    params.set("cursor", cursor);
    if (back) params.set("back", "1");
  }
  const suffix = params.toString();
  return suffix ? `${basePath}?${suffix}` : basePath;
}

function setFilterParam(params: URLSearchParams, key: string, value: string | undefined) {
  if (value && value !== "all") params.set(key, value);
}

function setIfDesc(params: URLSearchParams, key: string, dir: SortDir | undefined) {
  if (dir === "desc") params.set(key, "desc");
}

function setOptionalParam(params: URLSearchParams, key: string, value: string | undefined) {
  if (value) params.set(key, value);
}
