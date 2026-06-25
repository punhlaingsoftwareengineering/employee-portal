import { pgEnum } from 'drizzle-orm/pg-core';
import { EMPLOYEE_STATUSES } from '../../../constants/employee-status';
import { PORTAL_ROLES, INVITE_STATUSES } from '../../../constants/user-roles';
import {
	ANNOUNCEMENT_TYPES,
	ANNOUNCEMENT_ACCENT_PRESETS
} from '../../../constants/announcement';
import { NOTIFICATION_PRIORITIES } from '../../../constants/notification';

export const employeeStatusEnum = pgEnum('employee_status', EMPLOYEE_STATUSES);
export const portalRoleEnum = pgEnum('portal_role', PORTAL_ROLES);
export const inviteStatusEnum = pgEnum('invite_status', INVITE_STATUSES);
export const announcementTypeEnum = pgEnum('announcement_type', ANNOUNCEMENT_TYPES);
export const announcementAccentPresetEnum = pgEnum(
	'announcement_accent_preset',
	ANNOUNCEMENT_ACCENT_PRESETS
);
export const notificationPriorityEnum = pgEnum('notification_priority', NOTIFICATION_PRIORITIES);

export type { EmployeeStatus } from '../../../constants/employee-status';
export type { PortalRole, InviteStatus } from '../../../constants/user-roles';
export type {
	AnnouncementType,
	AnnouncementAccentPreset
} from '../../../constants/announcement';
export type { NotificationPriority } from '../../../constants/notification';
