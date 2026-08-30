import type { Prisma } from "@platform/db/client";
import type {
  ClientInvitationRow,
  ClientMemberRow,
  ClientRequestRow,
} from "@platform/users/client-team";

import {
  dateSeek,
  relationTextSeek,
  type SeekSpec,
  type SortDir,
  textSeek,
} from "@platform/users/list";

export interface SortDef<Row, Order> {
  orderBy: (dir: SortDir) => Order;
  spec: SeekSpec;
  valueOf: (row: Row) => Date | string;
}

export const clientMemberSorts: Record<
  string,
  SortDef<ClientMemberRow, Prisma.MembershipOrderByWithRelationInput>
> = {
  name: {
    orderBy: (dir) => ({ user: { name: dir } }),
    spec: relationTextSeek("user", "name"),
    valueOf: (row) => row.name,
  },
  email: {
    orderBy: (dir) => ({ user: { email: dir } }),
    spec: relationTextSeek("user", "email"),
    valueOf: (row) => row.email,
  },
  role: {
    orderBy: (dir) => ({ role: dir }),
    spec: textSeek("role"),
    valueOf: (row) => row.role,
  },
  joined: {
    orderBy: (dir) => ({ createdAt: dir }),
    spec: dateSeek("createdAt"),
    valueOf: (row) => row.joinedAt,
  },
};

export const clientInvitationSorts: Record<
  string,
  SortDef<ClientInvitationRow, Prisma.InvitationOrderByWithRelationInput>
> = {
  email: {
    orderBy: (dir) => ({ email: dir }),
    spec: textSeek("email"),
    valueOf: (row) => row.email,
  },
  created: {
    orderBy: (dir) => ({ createdAt: dir }),
    spec: dateSeek("createdAt"),
    valueOf: (row) => row.createdAt,
  },
};

export const clientRequestSorts: Record<
  string,
  SortDef<ClientRequestRow, Prisma.CompanyAccessRequestOrderByWithRelationInput>
> = {
  name: {
    orderBy: (dir) => ({ user: { name: dir } }),
    spec: relationTextSeek("user", "name"),
    valueOf: (row) => row.user.name,
  },
  created: {
    orderBy: (dir) => ({ createdAt: dir }),
    spec: dateSeek("createdAt"),
    valueOf: (row) => row.createdAt,
  },
};
