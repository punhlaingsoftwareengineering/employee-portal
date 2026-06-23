import { pgEnum } from 'drizzle-orm/pg-core';
import { EMPLOYEE_STATUSES } from '../../../constants/employee-status';
import { PORTAL_ROLES, INVITE_STATUSES } from '../../../constants/user-roles';

export const employeeStatusEnum = pgEnum('employee_status', EMPLOYEE_STATUSES);
export const portalRoleEnum = pgEnum('portal_role', PORTAL_ROLES);
export const inviteStatusEnum = pgEnum('invite_status', INVITE_STATUSES);

export type { EmployeeStatus } from '../../../constants/employee-status';
export type { PortalRole, InviteStatus } from '../../../constants/user-roles';
