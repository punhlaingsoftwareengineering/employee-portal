import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as notificationSoundService from '$lib/server/services/notification-sound';
import {
	createNotificationSoundSchema,
	updateNotificationSoundSchema
} from '$lib/schemas/notification-sound';
import { requireAppAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireAppAccess(getRequestEvent());
}

export const getNotificationSounds = query(async () =>
	notificationSoundService.listNotificationSounds(await perms())
);

export const getNotificationSound = query(z.string().uuid(), async (id) =>
	notificationSoundService.getNotificationSound(await perms(), id)
);

export const createNotificationSound = command(createNotificationSoundSchema, async (data) => {
	const record = await notificationSoundService.createNotificationSound(await perms(), data);
	void getNotificationSounds().refresh();
	return record;
});

export const updateNotificationSound = command(
	z.object({
		id: z.string().uuid(),
		...updateNotificationSoundSchema.shape
	}),
	async ({ id, ...data }) => {
		const record = await notificationSoundService.updateNotificationSound(await perms(), id, data);
		void getNotificationSounds().refresh();
		void getNotificationSound(id).refresh();
		return record;
	}
);

export const deleteNotificationSound = command(z.string().uuid(), async (id) => {
	await notificationSoundService.deleteNotificationSound(await perms(), id);
	void getNotificationSounds().refresh();
});
