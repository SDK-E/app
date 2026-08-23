export { acceptInvitation } from "@/lib/users/acceptance";
export { recordUserManagementEvent } from "@/lib/users/audit";
export type { ActivityRow } from "@/lib/users/activity";
export { listUserManagementActivity } from "@/lib/users/activity";
export {
  assignCompanyMemberDirectly,
  setAccountActive,
  updateUserName,
} from "@/lib/users/assignment";
export {
  getClientTeamView,
  type ClientInvitationRow,
  type ClientMemberRow,
  type ClientRequestRow,
  type ClientTeamView,
} from "@/lib/users/client-team";
export {
  getStaffDirectoryView,
  type StaffDirectoryView,
  type StaffInvitationRow,
  type StaffMemberRow,
  type StaffRequestRow,
} from "@/lib/users/staff-directory";
export { getUserDetail, type UserDetailView } from "@/lib/users/user-detail";
export { isUsersTab, usersTabs, type TabCounts, type UsersTab } from "@/lib/users/tabs";
export {
  approveCompanyAccessRequest,
  declineCompanyAccessRequest,
  getUserAccessRequests,
  listCompanyAccessRequests,
  requestCompanyAccess,
} from "@/lib/users/access-requests";
export {
  createClientInvitation,
  createStaffInvitation,
  getInvitationPreview,
  markInvitationDelivery,
  renewInvitation,
  restoreInvitationDelivery,
  revokeInvitation,
} from "@/lib/users/invitations";
export { removeMembership, updateMembershipRole } from "@/lib/users/memberships";
export { canManageUsers, hashInvitationToken } from "@/lib/users/shared";
export { updateStaffUser } from "@/lib/users/staff";
