import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getUserPermissions } from '$lib/server/services/portal-user';
import { canUserAccessService } from '$lib/server/services/service';
import {
	hasAppAccess,
	canAccessTools,
	canManageCommunity,
	canAccessDashboard,
	canAccessEmployeesPage,
	canAccessDepartmentsPage,
	canAccessFacilitiesPage,
	canAccessPharmacyPage,
	canAccessSettings
} from '$lib/server/permissions';
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

async function requirePageAccess(
	event: RequestEvent,
	allowed: (perms: UserPermissions) => boolean
): Promise<UserPermissions> {
	const perms = await requireAppAccess(event);
	if (!allowed(perms)) error(403, 'Forbidden');
	return perms;
}

export async function requireDashboardAccess(event: RequestEvent): Promise<UserPermissions> {
	return requirePageAccess(event, canAccessDashboard);
}

export async function requireEmployeesAccess(event: RequestEvent): Promise<UserPermissions> {
	return requirePageAccess(event, canAccessEmployeesPage);
}

export async function requireDepartmentsAccess(event: RequestEvent): Promise<UserPermissions> {
	return requirePageAccess(event, canAccessDepartmentsPage);
}

export async function requireFacilitiesAccess(event: RequestEvent): Promise<UserPermissions> {
	return requirePageAccess(event, canAccessFacilitiesPage);
}

export async function requirePharmacyAccess(event: RequestEvent): Promise<UserPermissions> {
	return requirePageAccess(event, canAccessPharmacyPage);
}

export async function requireSettingsAccess(event: RequestEvent): Promise<UserPermissions> {
	return requirePageAccess(event, canAccessSettings);
}

export async function requireCommunityManage(event: RequestEvent): Promise<UserPermissions> {
	return requirePageAccess(event, canManageCommunity);
}

export async function requireToolsAccess(event: RequestEvent): Promise<UserPermissions> {
	return requirePageAccess(event, canAccessTools);
}

export async function requireServiceAccess(
	event: RequestEvent,
	serviceId: string
): Promise<UserPermissions> {
	const perms = await requireToolsAccess(event);
	if (!(await canUserAccessService(perms, serviceId))) error(403, 'Forbidden');
	return perms;
}
