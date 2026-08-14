import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRequestPermissions } from '$lib/server/auth-guard';
import { canRolesCreate, canRolesRead } from '$lib/server/permissions';
import * as accessRoleService from '$lib/server/services/access-role';
import { createAccessRoleSchema } from '$lib/schemas/access-role';

export const GET: RequestHandler = async (event) => {
	const perms = await getRequestPermissions(event);
	if (!canRolesRead(perms)) error(403, 'Forbidden');
	const roles = await accessRoleService.listAccessRoles();
	return json(roles);
};

export const POST: RequestHandler = async (event) => {
	const perms = await getRequestPermissions(event);
	if (!canRolesCreate(perms)) error(403, 'Forbidden');
	const body = await event.request.json();
	const data = createAccessRoleSchema.parse(body);
	const role = await accessRoleService.createAccessRole(data);
	return json(role, { status: 201 });
};
