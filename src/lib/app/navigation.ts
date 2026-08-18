export function resolveActiveCompanyId(pathname: string): string | null {
  const match = pathname.match(/(?:^|\/)?(?:[^/]+?\/)?app\/companies\/([^/]+)(?:\/|$)/);
  return match ? decodeURIComponent(match[1]) : null;
}
