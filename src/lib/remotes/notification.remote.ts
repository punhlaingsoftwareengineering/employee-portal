import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as notificationService from '$lib/server/services/notification';
import { createNotificationSchema, updateNotificationSchema } from '$lib/schemas/notification';
import { requireAppAccess, requireUser } from '$lib/server/auth-guard';

async function perms() {
	return requireAppAccess(getRequestEvent());
}

export const getNotifications = query(async () =>
	notificationService.listNotifications(await perms())
);

export const getNotification = query(z.string().uuid(), async (id) =>
	notificationService.getNotification(await perms(), id)
);

export const createNotification = command(createNotificationSchema, async (data) => {
	const record = await notificationService.createNotification(await perms(), data);
	void getNotifications().refresh();
	return record;
});

export const updateNotification = command(
	z.object({
		id: z.string().uuid(),
		...updateNotificationSchema.shape
	}),
	async ({ id, ...data }) => {
		const record = await notificationService.updateNotification(await perms(), id, data);
		void getNotifications().refresh();
		void getNotification(id).refresh();
		return record;
	}
);

export const deleteNotification = command(z.string().uuid(), async (id) => {
	await notificationService.deleteNotification(await perms(), id);
	void getNotifications().refresh();
});

export const dismissNotification = command(z.string().uuid(), async (id) => {
	const user = requireUser(getRequestEvent());
	await notificationService.dismissNotification(user.id, id);
});

export const dismissAllNotifications = command(z.array(z.string().uuid()), async (ids) => {
	const user = requireUser(getRequestEvent());
	await notificationService.dismissAllNotifications(user.id, ids);
});
