import { error, type RequestHandler } from '@sveltejs/kit';
import { getRequestPermissions } from '$lib/server/auth-guard';
import * as portalUserService from '$lib/server/services/portal-user';
import { deletePortalUserSchema } from '$lib/schemas/portal-user';

export const DELETE: RequestHandler = async (event) => {
	const perms = await getRequestPermissions(event);
	if (!perms.isAdmin) error(403, 'Forbidden');
	const userId = deletePortalUserSchema.parse(event.params.id);
	await portalUserService.deletePortalUser(perms, userId);
	return new Response(null, { status: 204 });
};
