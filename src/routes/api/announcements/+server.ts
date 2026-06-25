import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAppAccess } from '$lib/server/auth-guard';
import * as announcementService from '$lib/server/services/announcement';
import { createAnnouncementSchema } from '$lib/schemas/announcement';

export const GET: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const announcements = await announcementService.listAnnouncements(perms);
	return json(announcements);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const body = await event.request.json();
	const data = createAnnouncementSchema.parse(body);
	const record = await announcementService.createAnnouncement(perms, data);
	return json(record, { status: 201 });
};
