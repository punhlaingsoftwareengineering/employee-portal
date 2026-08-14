import { error, json, type RequestHandler } from '@sveltejs/kit';
import { getRequestPermissions } from '$lib/server/auth-guard';
import { canUsersInviteResend, canUsersInviteRevoke } from '$lib/server/permissions';
import * as inviteService from '$lib/server/services/user-invite';

export const POST: RequestHandler = async (event) => {
	const perms = await getRequestPermissions(event);
	if (!canUsersInviteResend(perms)) error(403, 'Forbidden');
	const invite = await inviteService.resendInvite(event.params.id!);
	return json(invite);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await getRequestPermissions(event);
	if (!canUsersInviteRevoke(perms)) error(403, 'Forbidden');
	await inviteService.revokeInvite(event.params.id!);
	return new Response(null, { status: 204 });
};
