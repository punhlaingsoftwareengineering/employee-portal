import { json, type RequestHandler } from '@sveltejs/kit';
import { requireCommunityManage } from '$lib/server/auth-guard';
import * as communityLinkService from '$lib/server/services/community-link';
import { updateCommunityLinkSchema } from '$lib/schemas/community-link';

export const GET: RequestHandler = async (event) => {
	const perms = await requireCommunityManage(event);
	const record = await communityLinkService.getCommunityLink(perms, event.params.id!);
	return json(record);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireCommunityManage(event);
	const body = await event.request.json();
	const data = updateCommunityLinkSchema.parse(body);
	const record = await communityLinkService.updateCommunityLink(perms, event.params.id!, data);
	return json(record);
};

export const DELETE: RequestHandler = async (event) => {
	const perms = await requireCommunityManage(event);
	await communityLinkService.deleteCommunityLink(perms, event.params.id!);
	return new Response(null, { status: 204 });
};
