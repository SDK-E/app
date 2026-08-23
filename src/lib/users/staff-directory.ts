import { requireSdkStaff } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db";
import {
  buildSeekWhere,
  decodeCursor,
  queryDir,
  toPageResult,
  USER_PAGE_SIZE,
  type ListParams,
  type PageResult,
  type SortDir,
} from "@/lib/users/list";
import type { TabCounts, UsersTab } from "@/lib/users/tabs";
import {
  staffInvitationSorts,
  staffMemberSorts,
  staffRequestSorts,
} from "@/lib/users/staff-directory-sorts";

export interface StaffMemberRow {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  sdkStaffRole: string | null;
  createdAt: Date;
  memberships: { id: string; role: string; company: { id: string; name: string } }[];
}

export interface StaffInvitationRow {
  id: string;
  email: string;
  kind: string;
  clientRole: string | null;
  sdkStaffRole: string | null;
  expiresAt: Date;
  deliveryStatus: string;
  createdAt: Date;
  company: { id: string; name: string } | null;
}

export interface StaffRequestRow {
  id: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
  requestedRole: string;
  createdAt: Date;
  company: { id: string; name: string };
}

export interface StaffDirectoryView {
  kind: "staff";
  tab: UsersTab;
  companies: { id: string; name: string }[];
  members: PageResult<StaffMemberRow>;
  invitations: PageResult<StaffInvitationRow>;
  requests: PageResult<StaffRequestRow>;
  counts: TabCounts;
}

const memberSorts = staffMemberSorts;
const invitationSorts = staffInvitationSorts;
const requestSorts = staffRequestSorts;

function resolveSort<Def>(sort: string | undefined, fallback: string, defs: Record<string, Def>) {
  return defs[sort && sort in defs ? sort : fallback];
}

export async function getStaffDirectoryView(
  principal: Parameters<typeof requireSdkStaff>[0],
  tab: UsersTab,
  params: ListParams & { companyId?: string; status?: "active" | "inactive" }
): Promise<StaffDirectoryView> {
  requireSdkStaff(principal, ["ADMIN"]);
  const db = getPrisma();
  const dir: SortDir = params.dir === "desc" ? "desc" : "asc";
  const seekDir = queryDir(dir, params.back);
  const cursor = decodeCursor(params.cursor);
  const query = params.query?.trim();
  const companyFilter = params.companyId;

  const [companies, memberCount, invitationCount, requestCount] = await Promise.all([
    db.company.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.user.count({}),
    db.invitation.count({ where: { acceptedAt: null, revokedAt: null } }),
    db.companyAccessRequest.count({ where: { status: "PENDING" } }),
  ]);

  const counts: TabCounts = {
    members: memberCount,
    invitations: invitationCount,
    requests: requestCount,
  };

  let members: PageResult<StaffMemberRow> = { rows: [], nextCursor: null, prevCursor: null };
  let invitations: PageResult<StaffInvitationRow> = {
    rows: [],
    nextCursor: null,
    prevCursor: null,
  };
  let requests: PageResult<StaffRequestRow> = { rows: [], nextCursor: null, prevCursor: null };

  if (tab === "members") {
    const def = resolveSort(params.sort, "created", memberSorts);
    const fetched = await db.user.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(params.status === "active" ? { isActive: true } : {}),
        ...(params.status === "inactive" ? { isActive: false } : {}),
        ...(companyFilter ? { memberships: { some: { companyId: companyFilter } } } : {}),
        ...buildSeekWhere(cursor, seekDir, def.spec),
      },
      include: {
        memberships: { include: { company: { select: { id: true, name: true } } } },
      },
      orderBy: [def.orderBy(seekDir)],
      take: USER_PAGE_SIZE + 1,
    });
    const rows: StaffMemberRow[] = fetched.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      sdkStaffRole: user.sdkStaffRole,
      createdAt: user.createdAt,
      memberships: user.memberships.map((membership) => ({
        id: membership.id,
        role: membership.role,
        company: { id: membership.company.id, name: membership.company.name },
      })),
    }));
    members = toPageResult(rows, (row) => ({ v: def.valueOf(row), id: row.id }), USER_PAGE_SIZE, {
      back: params.back,
    });
  }

  if (tab === "invitations") {
    const def = resolveSort(params.sort, "created", invitationSorts);
    const fetched = await db.invitation.findMany({
      where: {
        acceptedAt: null,
        revokedAt: null,
        ...(companyFilter ? { companyId: companyFilter } : {}),
        ...(query ? { email: { contains: query, mode: "insensitive" } } : {}),
        ...buildSeekWhere(cursor, seekDir, def.spec),
      },
      include: { company: { select: { id: true, name: true } } },
      orderBy: [def.orderBy(seekDir)],
      take: USER_PAGE_SIZE + 1,
    });
    const rows: StaffInvitationRow[] = fetched.map((invitation) => ({
      id: invitation.id,
      email: invitation.email,
      kind: invitation.kind,
      clientRole: invitation.clientRole,
      sdkStaffRole: invitation.sdkStaffRole,
      expiresAt: invitation.expiresAt,
      deliveryStatus: invitation.deliveryStatus,
      createdAt: invitation.createdAt,
      company: invitation.company
        ? { id: invitation.company.id, name: invitation.company.name }
        : null,
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
        status: "PENDING",
        ...(companyFilter ? { companyId: companyFilter } : {}),
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
        company: { select: { id: true, name: true } },
      },
      orderBy: [def.orderBy(seekDir)],
      take: USER_PAGE_SIZE + 1,
    });
    const rows: StaffRequestRow[] = fetched.map((request) => ({
      id: request.id,
      user: request.user,
      requestedRole: request.requestedRole,
      createdAt: request.createdAt,
      company: { id: request.company.id, name: request.company.name },
    }));
    requests = toPageResult(rows, (row) => ({ v: def.valueOf(row), id: row.id }), USER_PAGE_SIZE, {
      back: params.back,
    });
  }

  return { kind: "staff", tab, companies, members, invitations, requests, counts };
}
