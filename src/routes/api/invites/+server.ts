import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guard';
import * as inviteService from '$lib/server/services/user-invite';
import { createInviteSchema } from '$lib/schemas/user-invite';

export const GET: RequestHandler = async (event) => {
	await requireAdmin(event);
	const invites = await inviteService.listInvites();
	return json(invites);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireAdmin(event);
	const body = await event.request.json();
	const data = createInviteSchema.parse(body);
	const invite = await inviteService.createInvite(perms.userId, data);
	return json(invite, { status: 201 });
};
