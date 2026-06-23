import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/auth-guard';
import * as appService from '$lib/server/services/app';
import { createAppSchema } from '$lib/schemas/app';

export const GET: RequestHandler = async (event) => {
	await requireAdmin(event);
	const apps = await appService.listApps();
	return json(apps);
};

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);
	const body = await event.request.json();
	const data = createAppSchema.parse(body);
	const record = await appService.createApp(data);
	return json(record, { status: 201 });
};
