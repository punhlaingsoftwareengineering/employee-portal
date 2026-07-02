import { json, type RequestHandler } from '@sveltejs/kit';
import { requireCommunityManage } from '$lib/server/auth-guard';
import * as communityCategoryService from '$lib/server/services/community-category';
import { createCommunityCategorySchema } from '$lib/schemas/community-category';

export const GET: RequestHandler = async (event) => {
	const perms = await requireCommunityManage(event);
	const categories = await communityCategoryService.listCommunityCategories(perms);
	return json(categories);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireCommunityManage(event);
	const body = await event.request.json();
	const data = createCommunityCategorySchema.parse(body);
	const record = await communityCategoryService.createCommunityCategory(perms, data);
	return json(record, { status: 201 });
};
