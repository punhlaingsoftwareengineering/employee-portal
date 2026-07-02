import { pgEnum } from 'drizzle-orm/pg-core';
import { EMPLOYEE_STATUSES } from '../../../constants/employee-status';
import { PORTAL_ROLES, INVITE_STATUSES } from '../../../constants/user-roles';
import {
	ANNOUNCEMENT_TYPES,
	ANNOUNCEMENT_ACCENT_PRESETS
} from '../../../constants/announcement';
import { NOTIFICATION_PRIORITIES } from '../../../constants/notification';
import { SUPPORT_TICKET_STATUSES } from '../../../constants/support-ticket';
import {
	SUPPORT_TICKET_CATEGORIES,
	SUPPORT_TICKET_URGENCIES
} from '../../../constants/support-ticket';
import { COMMUNITY_PLATFORMS } from '../../../constants/community';

export const employeeStatusEnum = pgEnum('employee_status', EMPLOYEE_STATUSES);
export const portalRoleEnum = pgEnum('portal_role', PORTAL_ROLES);
export const inviteStatusEnum = pgEnum('invite_status', INVITE_STATUSES);
export const announcementTypeEnum = pgEnum('announcement_type', ANNOUNCEMENT_TYPES);
export const announcementAccentPresetEnum = pgEnum(
	'announcement_accent_preset',
	ANNOUNCEMENT_ACCENT_PRESETS
);
export const notificationPriorityEnum = pgEnum('notification_priority', NOTIFICATION_PRIORITIES);
export const supportTicketStatusEnum = pgEnum('support_ticket_status', SUPPORT_TICKET_STATUSES);
export const supportTicketCategoryEnum = pgEnum('support_ticket_category', SUPPORT_TICKET_CATEGORIES);
export const supportTicketUrgencyEnum = pgEnum('support_ticket_urgency', SUPPORT_TICKET_URGENCIES);
export const communityPlatformEnum = pgEnum('community_platform', COMMUNITY_PLATFORMS);

export type { EmployeeStatus } from '../../../constants/employee-status';
export type { PortalRole, InviteStatus } from '../../../constants/user-roles';
export type {
	AnnouncementType,
	AnnouncementAccentPreset
} from '../../../constants/announcement';
export type { NotificationPriority } from '../../../constants/notification';
export type { SupportTicketStatus } from '../../../constants/support-ticket';
export type {
	SupportTicketCategory,
	SupportTicketUrgency
} from '../../../constants/support-ticket';
export type { CommunityPlatform } from '../../../constants/community';
