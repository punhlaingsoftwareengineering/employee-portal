import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/auth-guard';
import * as serviceService from '$lib/server/services/service';
import { createServiceSchema } from '$lib/schemas/service';

export const GET: RequestHandler = async (event) => {
	await requireAdmin(event);
	const services = await serviceService.listServices();
	return json(services);
};

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);
	const body = await event.request.json();
	const data = createServiceSchema.parse(body);
	const record = await serviceService.createService(data);
	return json(record, { status: 201 });
};
