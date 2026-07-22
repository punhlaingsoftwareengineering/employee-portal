import { json, type RequestHandler } from '@sveltejs/kit';
import { requireSettingsAccess } from '$lib/server/auth-guard';
import * as newsletterService from '$lib/server/services/newsletter';
import { createNewsletterSchema } from '$lib/schemas/newsletter';

export const GET: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	const newsletters = await newsletterService.listNewsletters(perms);
	return json(newsletters);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	const body = await event.request.json();
	const data = createNewsletterSchema.parse(body);
	const record = await newsletterService.createNewsletter(perms, data);
	return json(record, { status: 201 });
};
