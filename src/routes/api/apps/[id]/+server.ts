import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireToolsAccess } from '$lib/server/auth-guard';
import { canToolsAppDelete, canToolsAppUpdate } from '$lib/server/permissions';
import * as appService from '$lib/server/services/app';
import { updateAppSchema } from '$lib/schemas/app';

export const GET: RequestHandler = async (event) => {
	await requireToolsAccess(event);
	return json(await appService.getApp(event.params.id!));
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireToolsAccess(event);
	if (!canToolsAppUpdate(perms)) error(403, 'Forbidden');
	const body = await event.request.json();
	const data = updateAppSchema.parse({ ...body, id: event.params.id });
	const record = await appService.updateApp(perms, data);
	return json(record);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireToolsAccess(event);
	if (!canToolsAppDelete(perms)) error(403, 'Forbidden');
	await appService.deleteApp(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
