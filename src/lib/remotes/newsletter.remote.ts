import { query, command } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as newsletterService from '$lib/server/services/newsletter';
import {
	createNewsletterSchema,
	updateNewsletterSchema
} from '$lib/schemas/newsletter';
import { requireAppAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireAppAccess(getRequestEvent());
}

export const getNewsletters = query(async () => newsletterService.listNewsletters(await perms()));

export const getNewsletter = query(z.string().uuid(), async (id) =>
	newsletterService.getNewsletter(await perms(), id)
);

export const createNewsletter = command(createNewsletterSchema, async (data) => {
	const record = await newsletterService.createNewsletter(await perms(), data);
	void getNewsletters().refresh();
	return record;
});

export const updateNewsletter = command(
	z.object({
		id: z.string().uuid(),
		...updateNewsletterSchema.shape
	}),
	async ({ id, ...data }) => {
		const record = await newsletterService.updateNewsletter(await perms(), id, data);
		void getNewsletters().refresh();
		void getNewsletter(id).refresh();
		return record;
	}
);

export const deleteNewsletter = command(z.string().uuid(), async (id) => {
	await newsletterService.deleteNewsletter(await perms(), id);
	void getNewsletters().refresh();
});
