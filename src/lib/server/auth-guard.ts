import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getUserPermissions } from '$lib/server/services/portal-user';
import { hasAppAccess, canManageCommunity } from '$lib/server/permissions';
import type { UserPermissions } from '$lib/server/permissions';

export function requireUser(event: RequestEvent) {
	if (!event.locals.user) error(401, 'Unauthorized');
	return event.locals.user;
}

export async function getRequestPermissions(event: RequestEvent): Promise<UserPermissions> {
	const user = requireUser(event);
	return getUserPermissions(user.id);
}

export async function requireAdmin(event: RequestEvent): Promise<UserPermissions> {
	const perms = await getRequestPermissions(event);
	if (!perms.isAdmin) error(403, 'Forbidden');
	return perms;
}

export async function requireAppAccess(event: RequestEvent): Promise<UserPermissions> {
	const perms = await getRequestPermissions(event);
	if (!hasAppAccess(perms)) error(403, 'Access pending');
	return perms;
}

export async function requireCommunityManage(event: RequestEvent): Promise<UserPermissions> {
	const perms = await requireAppAccess(event);
	if (!canManageCommunity(perms)) error(403, 'Forbidden');
	return perms;
}
