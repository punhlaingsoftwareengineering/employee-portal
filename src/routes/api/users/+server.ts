import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guard';
import * as portalUserService from '$lib/server/services/portal-user';
import { updateUserAccessSchema } from '$lib/schemas/portal-user';

export const GET: RequestHandler = async (event) => {
	await requireAdmin(event);
	const users = await portalUserService.listPortalUsers();
	return json(users);
};

export const PATCH: RequestHandler = async (event) => {
	await requireAdmin(event);
	const body = await event.request.json();
	const data = updateUserAccessSchema.parse(body);
	const permissions = await portalUserService.updateUserAccess(data);
	return json(permissions);
};
