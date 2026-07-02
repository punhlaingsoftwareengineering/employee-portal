import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAppAccess } from '$lib/server/auth-guard';
import * as toolLearningService from '$lib/server/services/tool-learning';
import { createToolLearningSchema } from '$lib/schemas/tool-learning';

export const GET: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const items = await toolLearningService.listToolLearnings(perms);
	return json(items);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const body = await event.request.json();
	const data = createToolLearningSchema.parse(body);
	const record = await toolLearningService.createToolLearning(perms, data);
	return json(record, { status: 201 });
};
