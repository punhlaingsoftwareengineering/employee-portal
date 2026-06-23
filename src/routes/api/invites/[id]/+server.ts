import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guard';
import * as inviteService from '$lib/server/services/user-invite';

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);
	const invite = await inviteService.resendInvite(event.params.id!);
	return json(invite);
};

export const DELETE: RequestHandler = async (event) => {
	await requireAdmin(event);
	await inviteService.revokeInvite(event.params.id!);
	return new Response(null, { status: 204 });
};
