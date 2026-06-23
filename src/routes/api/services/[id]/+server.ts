import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/auth-guard';
import * as serviceService from '$lib/server/services/service';
import { updateServiceSchema } from '$lib/schemas/service';

export const GET: RequestHandler = async (event) => {
	await requireAdmin(event);
	return json(await serviceService.getService(event.params.id!));
};

export const PATCH: RequestHandler = async (event) => {
	await requireAdmin(event);
	const body = await event.request.json();
	const data = updateServiceSchema.parse({ ...body, id: event.params.id });
	const record = await serviceService.updateService(data);
	return json(record);
};

export const DELETE: RequestHandler = async (event) => {
	await requireAdmin(event);
	await serviceService.deleteService(event.params.id!);
	return new Response(null, { status: 204 });
};
