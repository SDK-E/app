import type { Prisma } from "@sdk-e/db/client";
import {
  dateSeek,
  relationTextSeek,
  textSeek,
  type SeekSpec,
  type SortDir,
} from "@sdk-e/users/list";
import type {
  StaffInvitationRow,
  StaffMemberRow,
  StaffRequestRow,
} from "@sdk-e/users/staff-directory";

interface SortDef<Row, Order> {
  orderBy: (dir: SortDir) => Order;
  spec: SeekSpec;
  valueOf: (row: Row) => string | Date;
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
