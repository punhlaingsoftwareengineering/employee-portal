import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAppAccess } from '$lib/server/auth-guard';
import * as announcementService from '$lib/server/services/announcement';
import { updateAnnouncementSchema } from '$lib/schemas/announcement';

export const GET: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const record = await announcementService.getAnnouncement(perms, event.params.id!);
	return json(record);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const body = await event.request.json();
	const data = updateAnnouncementSchema.parse(body);
	const record = await announcementService.updateAnnouncement(perms, event.params.id!, data);
	return json(record);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	await announcementService.deleteAnnouncement(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
