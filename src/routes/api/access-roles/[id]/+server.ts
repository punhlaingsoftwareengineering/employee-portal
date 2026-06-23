import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/auth-guard';
import * as accessRoleService from '$lib/server/services/access-role';
import { updateAccessRoleSchema } from '$lib/schemas/access-role';

export const GET: RequestHandler = async (event) => {
	await requireAdmin(event);
	return json(await accessRoleService.getAccessRole(event.params.id!));
};

export const PATCH: RequestHandler = async (event) => {
	await requireAdmin(event);
	const body = await event.request.json();
	const data = updateAccessRoleSchema.parse({ ...body, id: event.params.id });
	const role = await accessRoleService.updateAccessRole(data);
	return json(role);
};

export const DELETE: RequestHandler = async (event) => {
	await requireAdmin(event);
	await accessRoleService.deleteAccessRole(event.params.id!);
	return new Response(null, { status: 204 });
};
