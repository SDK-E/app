export function resolveActiveCompanyId(pathname: string): null | string {
  const match = pathname.match(/(?:^|\/)?(?:[^/]+?\/)?app\/companies\/([^/]+)(?:\/|$)/);
  return match ? decodeURIComponent(match[1]) : null;
}
