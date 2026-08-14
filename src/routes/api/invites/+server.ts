import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getRequestPermissions } from '$lib/server/auth-guard';
import { canUsersInvite, canUsersRead } from '$lib/server/permissions';
import * as inviteService from '$lib/server/services/user-invite';
import { createInviteSchema } from '$lib/schemas/user-invite';

export const GET: RequestHandler = async (event) => {
	const perms = await getRequestPermissions(event);
	if (!canUsersRead(perms)) error(403, 'Forbidden');
	const invites = await inviteService.listInvites();
	return json(invites);
};

export const POST: RequestHandler = async (event) => {
	const perms = await getRequestPermissions(event);
	if (!canUsersInvite(perms)) error(403, 'Forbidden');
	const body = await event.request.json();
	const data = createInviteSchema.parse(body);
	const invite = await inviteService.createInvite(perms.userId, data);
	return json(invite, { status: 201 });
};
