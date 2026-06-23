import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/auth-guard';
import * as appService from '$lib/server/services/app';
import { updateAppSchema } from '$lib/schemas/app';

export const GET: RequestHandler = async (event) => {
	await requireAdmin(event);
	return json(await appService.getApp(event.params.id!));
};

export const PATCH: RequestHandler = async (event) => {
	await requireAdmin(event);
	const body = await event.request.json();
	const data = updateAppSchema.parse({ ...body, id: event.params.id });
	const record = await appService.updateApp(data);
	return json(record);
};

export const DELETE: RequestHandler = async (event) => {
	await requireAdmin(event);
	await appService.deleteApp(event.params.id!);
	return new Response(null, { status: 204 });
};
