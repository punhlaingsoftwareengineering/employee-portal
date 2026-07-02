export const DASHBOARD_PINS_STORAGE_KEY_PREFIX = 'employee-portal-dashboard-pins';

export type DashboardPinKind = 'service' | 'app';

export type DashboardPinKey = `${DashboardPinKind}:${string}`;

export function dashboardPinKey(kind: DashboardPinKind, id: string): DashboardPinKey {
	return `${kind}:${id}`;
}

export function dashboardPinsStorageKey(userId: string): string {
	return `${DASHBOARD_PINS_STORAGE_KEY_PREFIX}:${userId}`;
}

export function parseDashboardPinKey(key: string): { kind: DashboardPinKind; id: string } | null {
	const separator = key.indexOf(':');
	if (separator <= 0) return null;

	const kind = key.slice(0, separator);
	const id = key.slice(separator + 1);
	if ((kind !== 'service' && kind !== 'app') || !id) return null;

	return { kind, id };
}
