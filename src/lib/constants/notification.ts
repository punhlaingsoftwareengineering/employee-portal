export const NOTIFICATION_PRIORITIES = ['info', 'success', 'warning', 'error'] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export const NOTIFICATION_PRIORITY_OPTIONS: { value: NotificationPriority; label: string }[] = [
	{ value: 'info', label: 'Info' },
	{ value: 'success', label: 'Success' },
	{ value: 'warning', label: 'Warning' },
	{ value: 'error', label: 'Error' }
];

export const DISMISSED_NOTIFICATIONS_KEY = 'employee-portal-dismissed-notifications';
export const NOTIFICATIONS_MUTED_KEY = 'employee-portal-notifications-muted';

export const NOTIFICATIONS_ROUTE = '/notifications';

export function isNotificationSoundUrl(url: string): boolean {
	try {
		const parsed = new URL(url.trim());
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

export function normalizeNotificationSoundUrl(url: string): string {
	return url.trim();
}

