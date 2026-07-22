import { json, type RequestHandler } from '@sveltejs/kit';
import { requireSettingsAccess } from '$lib/server/auth-guard';
import * as notificationService from '$lib/server/services/notification';
import { updateNotificationSchema } from '$lib/schemas/notification';

export const GET: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	const record = await notificationService.getNotification(perms, event.params.id!);
	return json(record);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	const body = await event.request.json();
	const data = updateNotificationSchema.parse(body);
	const record = await notificationService.updateNotification(perms, event.params.id!, data);
	return json(record);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	await notificationService.deleteNotification(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
