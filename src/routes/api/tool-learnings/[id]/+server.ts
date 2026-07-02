import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAppAccess } from '$lib/server/auth-guard';
import * as toolLearningService from '$lib/server/services/tool-learning';
import { updateToolLearningSchema } from '$lib/schemas/tool-learning';

export const GET: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const record = await toolLearningService.getToolLearning(perms, event.params.id!);
	return json(record);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	const body = await event.request.json();
	const data = updateToolLearningSchema.parse(body);
	const record = await toolLearningService.updateToolLearning(perms, event.params.id!, data);
	return json(record);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireAppAccess(event);
	await toolLearningService.deleteToolLearning(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
