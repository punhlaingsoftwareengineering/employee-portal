import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAppAccess } from '$lib/server/auth-guard';
import * as toolGuideService from '$lib/server/services/tool-guide';
import { createToolGuideSchema } from '$lib/schemas/tool-guide';

export const GET: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const guides = await toolGuideService.listToolGuides(perms);
	return json(guides);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const body = await event.request.json();
	const data = createToolGuideSchema.parse(body);
	const record = await toolGuideService.createToolGuide(perms, data);
	return json(record, { status: 201 });
};
