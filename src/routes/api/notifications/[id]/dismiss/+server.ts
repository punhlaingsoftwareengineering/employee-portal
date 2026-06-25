import type { RequestHandler } from '@sveltejs/kit';
import * as notificationService from '$lib/server/services/notification';

export const POST: RequestHandler = async (event) => {
	if (event.locals.user) {
		await notificationService.dismissNotification(event.locals.user.id, event.params.id!);
	}

	return new Response(null, { status: 204 });
};
