import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireToolsAccess } from '$lib/server/auth-guard';
import { canToolsServiceCreate } from '$lib/server/permissions';
import * as serviceService from '$lib/server/services/service';
import { createServiceSchema } from '$lib/schemas/service';

export const GET: RequestHandler = async (event) => {
	await requireToolsAccess(event);
	const services = await serviceService.listServices();
	return json(services);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireToolsAccess(event);
	if (!canToolsServiceCreate(perms)) error(403, 'Forbidden');
	const body = await event.request.json();
	const data = createServiceSchema.parse(body);
	const record = await serviceService.createService(perms, data);
	return json(record, { status: 201 });
};
