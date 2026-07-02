import { json, type RequestHandler } from '@sveltejs/kit';
import { requireCommunityManage } from '$lib/server/auth-guard';
import * as communityLinkService from '$lib/server/services/community-link';
import { createCommunityLinkSchema } from '$lib/schemas/community-link';

export const GET: RequestHandler = async (event) => {
	const perms = await requireCommunityManage(event);
	const links = await communityLinkService.listCommunityLinks(perms);
	return json(links);
};

export const POST: RequestHandler = async (event) => {
	const perms = await requireCommunityManage(event);
	const body = await event.request.json();
	const data = createCommunityLinkSchema.parse(body);
	const record = await communityLinkService.createCommunityLink(perms, data);
	return json(record, { status: 201 });
};
