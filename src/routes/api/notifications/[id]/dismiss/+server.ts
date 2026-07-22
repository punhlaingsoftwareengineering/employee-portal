import type { RequestHandler } from '@sveltejs/kit';
import { requireAppAccess } from '$lib/server/auth-guard';
import * as notificationService from '$lib/server/services/notification';

export const POST: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	await notificationService.dismissNotification(perms.userId, event.params.id!);
	return new Response(null, { status: 204 });
};
