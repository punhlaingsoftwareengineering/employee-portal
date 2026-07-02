import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAppAccess } from '$lib/server/auth-guard';
import * as toolGuideService from '$lib/server/services/tool-guide';
import { updateToolGuideSchema } from '$lib/schemas/tool-guide';

export const GET: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const record = await toolGuideService.getToolGuide(perms, event.params.id!);
	return json(record);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const body = await event.request.json();
	const data = updateToolGuideSchema.parse(body);
	const record = await toolGuideService.updateToolGuide(perms, event.params.id!, data);
	return json(record);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	await toolGuideService.deleteToolGuide(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
