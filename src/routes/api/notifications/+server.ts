import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAppAccess } from '$lib/server/auth-guard';
import * as notificationService from '$lib/server/services/notification';
import { createNotificationSchema } from '$lib/schemas/notification';

export const GET: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const notifications = await notificationService.listNotifications(perms);
	return json(notifications);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const body = await event.request.json();
	const data = createNotificationSchema.parse(body);
	const record = await notificationService.createNotification(perms, data);
	return json(record, { status: 201 });
};
