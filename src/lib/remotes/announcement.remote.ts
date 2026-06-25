import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as announcementService from '$lib/server/services/announcement';
import {
	createAnnouncementSchema,
	updateAnnouncementSchema
} from '$lib/schemas/announcement';
import { requireAppAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireAppAccess(getRequestEvent());
}

export const getAnnouncements = query(async () =>
	announcementService.listAnnouncements(await perms())
);

export const getAnnouncement = query(z.string().uuid(), async (id) =>
	announcementService.getAnnouncement(await perms(), id)
);

export const createAnnouncement = command(createAnnouncementSchema, async (data) => {
	const record = await announcementService.createAnnouncement(await perms(), data);
	void getAnnouncements().refresh();
	return record;
});

export const updateAnnouncement = command(
	z.object({
		id: z.string().uuid(),
		...updateAnnouncementSchema.shape
	}),
	async ({ id, ...data }) => {
		const record = await announcementService.updateAnnouncement(await perms(), id, data);
		void getAnnouncements().refresh();
		void getAnnouncement(id).refresh();
		return record;
	}
);

export const deleteAnnouncement = command(z.string().uuid(), async (id) => {
	await announcementService.deleteAnnouncement(await perms(), id);
	void getAnnouncements().refresh();
});
