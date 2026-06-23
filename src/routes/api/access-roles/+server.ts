import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/auth-guard';
import * as accessRoleService from '$lib/server/services/access-role';
import { createAccessRoleSchema } from '$lib/schemas/access-role';

export const GET: RequestHandler = async (event) => {
	await requireAdmin(event);
	const roles = await accessRoleService.listAccessRoles();
	return json(roles);
};

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);
	const body = await event.request.json();
	const data = createAccessRoleSchema.parse(body);
	const role = await accessRoleService.createAccessRole(data);
	return json(role, { status: 201 });
};
