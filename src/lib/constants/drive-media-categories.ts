export const PORTAL_DRIVE_CATEGORIES = [
	'announcements',
	'facilities',
	'notifications',
	'onboarding-slides',
	'tool-guides',
	'tool-learnings',
	'newsletters',
	'notification-sounds',
	'apps',
	'services',
	'branding',
	'documentation'
] as const;

export type PortalDriveCategory = (typeof PORTAL_DRIVE_CATEGORIES)[number];

export const PORTAL_DRIVE_ROOT_FOLDER = 'portal';

export function isPortalDriveCategory(value: string): value is PortalDriveCategory {
	return (PORTAL_DRIVE_CATEGORIES as readonly string[]).includes(value);
}
