import { json, type RequestHandler } from '@sveltejs/kit';
import { requireCommunityManage } from '$lib/server/auth-guard';
import * as communityCategoryService from '$lib/server/services/community-category';
import { updateCommunityCategorySchema } from '$lib/schemas/community-category';

export const GET: RequestHandler = async (event) => {
	const perms = await requireCommunityManage(event);
	const record = await communityCategoryService.getCommunityCategory(perms, event.params.id!);
	return json(record);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireCommunityManage(event);
	const body = await event.request.json();
	const data = updateCommunityCategorySchema.parse(body);
	const record = await communityCategoryService.updateCommunityCategory(
		perms,
		event.params.id!,
		data
	);
	return json(record);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireCommunityManage(event);
	await communityCategoryService.deleteCommunityCategory(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
