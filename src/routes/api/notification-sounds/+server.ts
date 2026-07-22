import { json, type RequestHandler } from '@sveltejs/kit';
import { requireSettingsAccess } from '$lib/server/auth-guard';
import * as notificationSoundService from '$lib/server/services/notification-sound';
import { createNotificationSoundSchema } from '$lib/schemas/notification-sound';

export const GET: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	const sounds = await notificationSoundService.listNotificationSounds(perms);
	return json(sounds);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	const body = await event.request.json();
	const data = createNotificationSoundSchema.parse(body);
	const record = await notificationSoundService.createNotificationSound(perms, data);
	return json(record, { status: 201 });
};
