import { requireCompanyPageContext } from "@sdk-e/auth/authorization";
import { getPrisma } from "@sdk-e/db";
import {
  buildSeekWhere,
  decodeCursor,
  queryDir,
  toPageResult,
  USER_PAGE_SIZE,
  type ListParams,
  type PageResult,
  type SortDir,
} from "@sdk-e/users/list";
import type { TabCounts, UsersTab } from "@sdk-e/users/tabs";
import { canManageUsers, forbidden } from "@sdk-e/users/shared";
import {
  clientInvitationSorts,
  clientMemberSorts,
  clientRequestSorts,
} from "@sdk-e/users/client-team-sorts";

export interface ClientMemberRow {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  role: string;
  joinedAt: Date;
}

export interface ClientInvitationRow {
  id: string;
  email: string;
  clientRole: string | null;
  expiresAt: Date;
  deliveryStatus: string;
  createdAt: Date;
}

export interface ClientRequestRow {
  id: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
  requestedRole: string;
  createdAt: Date;
}

export interface ClientTeamView {
  kind: "client";
  company: { id: string; name: string; accessCode: string | null };
  tab: UsersTab;
  members: PageResult<ClientMemberRow>;
  invitations: PageResult<ClientInvitationRow>;
  requests: PageResult<ClientRequestRow>;
  counts: TabCounts;
}

const memberSorts = clientMemberSorts;
const invitationSorts = clientInvitationSorts;
const requestSorts = clientRequestSorts;

function resolveSort<Def>(sort: string | undefined, fallback: string, defs: Record<string, Def>) {
  return defs[sort && sort in defs ? sort : fallback];
}

export async function getClientTeamView(
  principal: Parameters<typeof requireCompanyPageContext>[0],
  companyId: string,
  tab: UsersTab,
  params: ListParams
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

  let members: PageResult<ClientMemberRow> = { rows: [], nextCursor: null, prevCursor: null };
  let invitations: PageResult<ClientInvitationRow> = {
    rows: [],
    nextCursor: null,
    prevCursor: null,
  };
  let requests: PageResult<ClientRequestRow> = { rows: [], nextCursor: null, prevCursor: null };

  if (tab === "members") {
    const def = resolveSort(params.sort, "joined", memberSorts);
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
    members = toPageResult(rows, (row) => ({ v: def.valueOf(row), id: row.id }), USER_PAGE_SIZE, {
      back: params.back,
    });
  }

  if (tab === "invitations") {
    const def = resolveSort(params.sort, "created", invitationSorts);
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
    invitations = toPageResult(
      rows,
      (row) => ({ v: def.valueOf(row), id: row.id }),
      USER_PAGE_SIZE,
      { back: params.back }
    );
  }

  if (tab === "requests") {
    const def = resolveSort(params.sort, "created", requestSorts);
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
    requests = toPageResult(rows, (row) => ({ v: def.valueOf(row), id: row.id }), USER_PAGE_SIZE, {
      back: params.back,
    });
  }

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
