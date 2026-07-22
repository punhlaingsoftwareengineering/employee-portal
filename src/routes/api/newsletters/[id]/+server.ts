import { json, type RequestHandler } from '@sveltejs/kit';
import { requireSettingsAccess } from '$lib/server/auth-guard';
import * as newsletterService from '$lib/server/services/newsletter';
import { updateNewsletterSchema } from '$lib/schemas/newsletter';

export const GET: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	const record = await newsletterService.getNewsletter(perms, event.params.id!);
	return json(record);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	const body = await event.request.json();
	const data = updateNewsletterSchema.parse(body);
	const record = await newsletterService.updateNewsletter(perms, event.params.id!, data);
	return json(record);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireSettingsAccess(event);
	await newsletterService.deleteNewsletter(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
