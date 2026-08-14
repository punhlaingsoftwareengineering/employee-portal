import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireToolsAccess } from '$lib/server/auth-guard';
import { canToolsServiceDelete, canToolsServiceUpdate } from '$lib/server/permissions';
import * as serviceService from '$lib/server/services/service';
import { updateServiceSchema } from '$lib/schemas/service';

export const GET: RequestHandler = async (event) => {
	await requireToolsAccess(event);
	return json(await serviceService.getService(event.params.id!));
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireToolsAccess(event);
	if (!canToolsServiceUpdate(perms)) error(403, 'Forbidden');
	const body = await event.request.json();
	const data = updateServiceSchema.parse({ ...body, id: event.params.id });
	const record = await serviceService.updateService(perms, data);
	return json(record);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireToolsAccess(event);
	if (!canToolsServiceDelete(perms)) error(403, 'Forbidden');
	await serviceService.deleteService(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
