import type { Prisma } from "@platform/db/client";
import type { TabCounts, UsersTab } from "@platform/users/tabs";

import { requireCompanyPageContext } from "@platform/auth/authorization";
import { getPrisma } from "@platform/db";
import {
  clientInvitationSorts,
  clientMemberSorts,
  clientRequestSorts,
  type SortDef,
} from "@platform/users/client-team-sorts";
import {
  buildSeekWhere,
  decodeCursor,
  type ListParams,
  type PageResult,
  queryDir,
  type SortDir,
  toPageResult,
  USER_PAGE_SIZE,
} from "@platform/users/list";
import { canManageUsers, forbidden } from "@platform/users/shared";

export interface ClientInvitationRow {
  id: string;
  email: string;
  clientRole: null | string;
  expiresAt: Date;
  deliveryStatus: string;
  createdAt: Date;
}

export interface ClientMemberRow {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: null | string;
  isActive: boolean;
  role: string;
  joinedAt: Date;
}

export interface ClientRequestRow {
  id: string;
  user: { id: string; name: string; email: string; avatarUrl: null | string };
  requestedRole: string;
  createdAt: Date;
}

export interface ClientTeamView {
  kind: "client";
  company: { id: string; name: string; accessCode: null | string };
  tab: UsersTab;
  members: PageResult<ClientMemberRow>;
  invitations: PageResult<ClientInvitationRow>;
  requests: PageResult<ClientRequestRow>;
  counts: TabCounts;
}

const memberSorts = clientMemberSorts;
const invitationSorts = clientInvitationSorts;
const requestSorts = clientRequestSorts;

export async function getClientTeamView(
  principal: Parameters<typeof requireCompanyPageContext>[0],
  companyId: string,
  tab: UsersTab,
  params: ListParams,
): Promise<ClientTeamView> {
  const context = requireCompanyPageContext(principal, companyId, "membership:view");
  if (!canManageUsers(context.principal, context.companyId))
    forbidden("User management is not available for this role.");
  const db = getPrisma();
  const scope = context.companyId;
  const dir: SortDir = params.dir === "desc" ? "desc" : "asc";
  const seekDir = queryDir(dir, params.back);
  const cursor = decodeCursor(params.cursor);
  const query = params.query?.trim();

  const { company, counts } = await fetchCounts(db, scope);

  const members =
    tab === "members"
      ? await fetchMembers(db, scope, query, cursor, seekDir, params, memberSorts)
      : emptyPage<ClientMemberRow>();
  const invitations =
    tab === "invitations"
      ? await fetchInvitations(db, scope, query, cursor, seekDir, params, invitationSorts)
      : emptyPage<ClientInvitationRow>();
  const requests =
    tab === "requests"
      ? await fetchRequests(db, scope, query, cursor, seekDir, params, requestSorts)
      : emptyPage<ClientRequestRow>();

  return {
    kind: "client",
    company: company ?? { id: scope, name: "", accessCode: null },
    tab,
    members,
    invitations,
    requests,
    counts,
  };
}

function emptyPage<T>(): PageResult<T> {
  return { rows: [], nextCursor: null, prevCursor: null };
}

async function fetchCounts(db: ReturnType<typeof getPrisma>, scope: string) {
  const [company, memberCount, invitationCount, requestCount] = await Promise.all([
    db.company.findUnique({
      where: { id: scope },
      select: { id: true, name: true, accessCode: true },
    }),
    db.membership.count({ where: { companyId: scope } }),
    db.invitation.count({ where: { companyId: scope, acceptedAt: null, revokedAt: null } }),
    db.companyAccessRequest.count({ where: { companyId: scope, status: "PENDING" } }),
  ]);
  const counts: TabCounts = {
    members: memberCount,
    invitations: invitationCount,
    requests: requestCount,
  };
  return { company, counts };
}

async function fetchInvitations(
  db: ReturnType<typeof getPrisma>,
  scope: string,
  query: string | undefined,
  cursor: ReturnType<typeof decodeCursor>,
  seekDir: SortDir,
  params: ListParams,
  sorts: Record<string, SortDef<ClientInvitationRow, Prisma.InvitationOrderByWithRelationInput>>,
) {
  const def = resolveSort(params.sort, "created", sorts);
  const fetched = await db.invitation.findMany({
    where: {
      companyId: scope,
      acceptedAt: null,
      revokedAt: null,
      ...(query ? { email: { contains: query, mode: "insensitive" } } : {}),
      ...buildSeekWhere(cursor, seekDir, def.spec),
    },
    select: {
      id: true,
      email: true,
      clientRole: true,
      expiresAt: true,
      deliveryStatus: true,
      createdAt: true,
    },
    orderBy: [def.orderBy(seekDir)],
    take: USER_PAGE_SIZE + 1,
  });
  const rows: ClientInvitationRow[] = fetched.map((invitation) => ({
    id: invitation.id,
    email: invitation.email,
    clientRole: invitation.clientRole,
    expiresAt: invitation.expiresAt,
    deliveryStatus: invitation.deliveryStatus,
    createdAt: invitation.createdAt,
  }));
  return toPageResult(rows, (row) => ({ v: def.valueOf(row), id: row.id }), USER_PAGE_SIZE, {
    back: params.back,
  });
}

async function fetchMembers(
  db: ReturnType<typeof getPrisma>,
  scope: string,
  query: string | undefined,
  cursor: ReturnType<typeof decodeCursor>,
  seekDir: SortDir,
  params: ListParams,
  sorts: Record<string, SortDef<ClientMemberRow, Prisma.MembershipOrderByWithRelationInput>>,
) {
  const def = resolveSort(params.sort, "joined", sorts);
  const fetched = await db.membership.findMany({
    where: {
      companyId: scope,
      ...(query
        ? {
            OR: [
              { user: { name: { contains: query, mode: "insensitive" } } },
              { user: { email: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...buildSeekWhere(cursor, seekDir, def.spec),
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true, isActive: true } },
    },
    orderBy: [def.orderBy(seekDir)],
    take: USER_PAGE_SIZE + 1,
  });
  const rows: ClientMemberRow[] = fetched.map((membership) => ({
    id: membership.id,
    userId: membership.user.id,
    name: membership.user.name,
    email: membership.user.email,
    avatarUrl: membership.user.avatarUrl,
    isActive: membership.user.isActive,
    role: membership.role,
    joinedAt: membership.joinedAt ?? membership.createdAt,
  }));
  return toPageResult(rows, (row) => ({ v: def.valueOf(row), id: row.id }), USER_PAGE_SIZE, {
    back: params.back,
  });
}

async function fetchRequests(
  db: ReturnType<typeof getPrisma>,
  scope: string,
  query: string | undefined,
  cursor: ReturnType<typeof decodeCursor>,
  seekDir: SortDir,
  params: ListParams,
  sorts: Record<
    string,
    SortDef<ClientRequestRow, Prisma.CompanyAccessRequestOrderByWithRelationInput>
  >,
) {
  const def = resolveSort(params.sort, "created", sorts);
  const fetched = await db.companyAccessRequest.findMany({
    where: {
      companyId: scope,
      status: "PENDING",
      ...(query
        ? {
            OR: [
              { user: { name: { contains: query, mode: "insensitive" } } },
              { user: { email: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...buildSeekWhere(cursor, seekDir, def.spec),
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: [def.orderBy(seekDir)],
    take: USER_PAGE_SIZE + 1,
  });
  const rows: ClientRequestRow[] = fetched.map((request) => ({
    id: request.id,
    user: request.user,
    requestedRole: request.requestedRole,
    createdAt: request.createdAt,
  }));
  return toPageResult(rows, (row) => ({ v: def.valueOf(row), id: row.id }), USER_PAGE_SIZE, {
    back: params.back,
  });
}

function resolveSort<Def>(sort: string | undefined, fallback: string, defs: Record<string, Def>) {
  return defs[sort && sort in defs ? sort : fallback];
}
