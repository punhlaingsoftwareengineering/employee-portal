import { json, type RequestHandler } from '@sveltejs/kit';
import { requireSettingsAccess } from '$lib/server/auth-guard';
import * as notificationSoundService from '$lib/server/services/notification-sound';
import { updateNotificationSoundSchema } from '$lib/schemas/notification-sound';

export const GET: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	const record = await notificationSoundService.getNotificationSound(perms, event.params.id!);
	return json(record);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	const body = await event.request.json();
	const data = updateNotificationSoundSchema.parse(body);
	const record = await notificationSoundService.updateNotificationSound(
		perms,
		event.params.id!,
		data
	);
	return json(record);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	await notificationSoundService.deleteNotificationSound(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
