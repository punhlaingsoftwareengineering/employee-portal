import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireToolsAccess } from '$lib/server/auth-guard';
import { canToolsAppCreate } from '$lib/server/permissions';
import * as appService from '$lib/server/services/app';
import { createAppSchema } from '$lib/schemas/app';

export const GET: RequestHandler = async (event) => {
	await requireToolsAccess(event);
	const apps = await appService.listApps();
	return json(apps);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireToolsAccess(event);
	if (!canToolsAppCreate(perms)) error(403, 'Forbidden');
	const body = await event.request.json();
	const data = createAppSchema.parse(body);
	const record = await appService.createApp(perms, data);
	return json(record, { status: 201 });
};
