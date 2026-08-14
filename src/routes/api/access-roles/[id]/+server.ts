import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRequestPermissions } from '$lib/server/auth-guard';
import { canRolesDelete, canRolesRead, canRolesUpdate } from '$lib/server/permissions';
import * as accessRoleService from '$lib/server/services/access-role';
import { updateAccessRoleSchema } from '$lib/schemas/access-role';

export const GET: RequestHandler = async (event) => {
	const perms = await getRequestPermissions(event);
	if (!canRolesRead(perms)) error(403, 'Forbidden');
	return json(await accessRoleService.getAccessRole(event.params.id!));
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await getRequestPermissions(event);
	if (!canRolesUpdate(perms)) error(403, 'Forbidden');
	const body = await event.request.json();
	const data = updateAccessRoleSchema.parse({ ...body, id: event.params.id });
	const role = await accessRoleService.updateAccessRole(data);
	return json(role);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await getRequestPermissions(event);
	if (!canRolesDelete(perms)) error(403, 'Forbidden');
	await accessRoleService.deleteAccessRole(event.params.id!);
	return new Response(null, { status: 204 });
};
