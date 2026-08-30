import type { Prisma } from "@platform/db/client";
import type {
  StaffInvitationRow,
  StaffMemberRow,
  StaffRequestRow,
} from "@platform/users/staff-directory";

import {
  dateSeek,
  relationTextSeek,
  type SeekSpec,
  type SortDir,
  textSeek,
} from "@platform/users/list";

interface SortDef<Row, Order> {
  orderBy: (dir: SortDir) => Order;
  spec: SeekSpec;
  valueOf: (row: Row) => Date | string;
}

export const staffMemberSorts: Record<
  string,
  SortDef<StaffMemberRow, Prisma.UserOrderByWithRelationInput>
> = {
  name: {
    orderBy: (dir) => ({ name: dir }),
    spec: textSeek("name"),
    valueOf: (row) => row.name,
  },
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

export const staffInvitationSorts: Record<
  string,
  SortDef<StaffInvitationRow, Prisma.InvitationOrderByWithRelationInput>
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

export const staffRequestSorts: Record<
  string,
  SortDef<StaffRequestRow, Prisma.CompanyAccessRequestOrderByWithRelationInput>
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
