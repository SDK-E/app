/**
 * Representative sample data so the design system can render the real
 * portal-user-management components without a session or database.
 */

import type {
  ActivityRow,
  ClientInvitationRow,
  ClientMemberRow,
  ClientRequestRow,
  StaffInvitationRow,
  StaffMemberRow,
  StaffRequestRow,
  UserDetailView,
} from "@platform/users";

const now = new Date("2026-08-01T09:00:00.000Z");
const later = new Date("2026-09-01T09:00:00.000Z");
const ACME = "Acme Corporation";
const NORTHWIND = "Northwind Traders";

export const staffMemberRows: StaffMemberRow[] = [
  {
    id: "user-owner",
    name: "Amelia Stone",
    email: "amelia@acme.test",
    avatarUrl: null,
    isActive: true,
    sdkStaffRole: null,
    createdAt: now,
    memberships: [{ id: "membership-1", role: "OWNER", company: { id: "company-1", name: ACME } }],
  },
  {
    id: "user-staff",
    name: "Noah Fields",
    email: "noah@sdk.enterprises",
    avatarUrl: null,
    isActive: false,
    sdkStaffRole: "DELIVERY",
    createdAt: now,
    memberships: [],
  },
  {
    id: "user-viewer",
    name: "Ines Duarte",
    email: "ines@acme.test",
    avatarUrl: null,
    isActive: true,
    sdkStaffRole: null,
    createdAt: now,
    memberships: [
      { id: "membership-2", role: "VIEWER", company: { id: "company-1", name: ACME } },
      { id: "membership-3", role: "BILLING", company: { id: "company-2", name: NORTHWIND } },
    ],
  },
];

export const clientMemberRows: ClientMemberRow[] = [
  {
    id: "membership-1",
    userId: "user-owner",
    name: "Amelia Stone",
    email: "amelia@acme.test",
    avatarUrl: null,
    isActive: true,
    role: "OWNER",
    joinedAt: now,
  },
  {
    id: "membership-4",
    userId: "user-member",
    name: "Ravi Chandra",
    email: "ravi@acme.test",
    avatarUrl: null,
    isActive: true,
    role: "PROJECT_MEMBER",
    joinedAt: now,
  },
];

export const invitationRows: StaffInvitationRow[] = [
  {
    id: "invitation-1",
    email: "dana@example.test",
    kind: "CLIENT",
    clientRole: "PROJECT_MEMBER",
    sdkStaffRole: null,
    expiresAt: later,
    deliveryStatus: "SENT",
    createdAt: now,
    company: { id: "company-1", name: ACME },
  },
  {
    id: "invitation-2",
    email: "lee@example.test",
    kind: "SDK_STAFF",
    clientRole: null,
    sdkStaffRole: "FINANCE",
    expiresAt: later,
    deliveryStatus: "FAILED",
    createdAt: now,
    company: null,
  },
];

export const clientInvitationRows: ClientInvitationRow[] = [
  {
    id: "invitation-3",
    email: "sam@example.test",
    clientRole: "BILLING",
    expiresAt: later,
    deliveryStatus: "PENDING",
    createdAt: now,
  },
];

export const requestRows: StaffRequestRow[] = [
  {
    id: "request-1",
    user: {
      id: "user-requester",
      name: "Petra Lind",
      email: "petra@example.test",
      avatarUrl: null,
    },
    requestedRole: "VIEWER",
    createdAt: now,
    company: { id: "company-1", name: ACME },
  },
];

export const clientRequestRows: ClientRequestRow[] = [
  {
    id: "request-2",
    user: {
      id: "user-requester",
      name: "Petra Lind",
      email: "petra@example.test",
      avatarUrl: null,
    },
    requestedRole: "PROJECT_MEMBER",
    createdAt: now,
  },
];

export const activityEvents: ActivityRow[] = [
  {
    id: "audit-1",
    companyId: "company-1",
    actorId: "user-owner",
    actorKind: "USER",
    actorName: "Amelia Stone",
    action: "membership.role_changed",
    targetType: "membership",
    targetId: "membership-2",
    fromState: "VIEWER",
    toState: "BILLING",
    createdAt: now,
  },
  {
    id: "audit-2",
    companyId: null,
    actorId: "staff-admin",
    actorKind: "SDK_STAFF",
    actorName: "SDK Admin",
    action: "user.active_changed",
    targetType: "user",
    targetId: "user-staff",
    fromState: "ACTIVE",
    toState: "INACTIVE",
    createdAt: now,
  },
];

export const fixtureUserDetail: UserDetailView = {
  kind: "staff-detail",
  user: {
    id: "user-viewer",
    name: "Ines Duarte",
    email: "ines@acme.test",
    avatarUrl: null,
    isActive: true,
    sdkStaffRole: null,
    createdAt: now,
    lastLoginAt: now,
  },
  memberships: [
    {
      id: "membership-2",
      role: "VIEWER",
      joinedAt: now,
      company: { id: "company-1", name: ACME, isActive: true },
    },
  ],
  pendingInvitations: [],
  accessRequests: [
    {
      id: "request-1",
      status: "DECLINED",
      requestedRole: "VIEWER",
      createdAt: now,
      company: { id: "company-2", name: NORTHWIND },
    },
  ],
  activity: activityEvents,
  companies: [
    { id: "company-1", name: ACME },
    { id: "company-2", name: NORTHWIND },
  ],
};
