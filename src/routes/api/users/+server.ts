import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getRequestPermissions } from '$lib/server/auth-guard';
import { canUsersRead, canUsersUpdate } from '$lib/server/permissions';
import * as portalUserService from '$lib/server/services/portal-user';
import { updateUserAccessSchema } from '$lib/schemas/portal-user';

export const GET: RequestHandler = async (event) => {
	const perms = await getRequestPermissions(event);
	if (!canUsersRead(perms)) error(403, 'Forbidden');
	const users = await portalUserService.listPortalUsers();
	return json(users);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await getRequestPermissions(event);
	if (!canUsersUpdate(perms)) error(403, 'Forbidden');
	const body = await event.request.json();
	const data = updateUserAccessSchema.parse(body);
	const permissions = await portalUserService.updateUserAccess(data);
	return json(permissions);
};
