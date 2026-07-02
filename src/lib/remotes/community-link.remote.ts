import { command, query } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as communityLinkService from '$lib/server/services/community-link';
import { createCommunityLinkSchema, updateCommunityLinkSchema } from '$lib/schemas/community-link';
import { requireCommunityManage, requireAdmin } from '$lib/server/auth-guard';
import { getCommunityCategories } from '$lib/remotes/community-category.remote';

async function perms() {
	return requireCommunityManage(getRequestEvent());
}

export const getCommunityLinks = query(async () =>
	communityLinkService.listCommunityLinks(await perms())
);

export const getCommunityLink = query(z.string().uuid(), async (id) =>
	communityLinkService.getCommunityLink(await perms(), id)
);

export const createCommunityLink = command(createCommunityLinkSchema, async (data) => {
	const record = await communityLinkService.createCommunityLink(await perms(), data);
	void getCommunityLinks().refresh();
	void getCommunityCategories().refresh();
	return record;
});

export const updateCommunityLink = command(
	z.object({
		id: z.string().uuid(),
		...updateCommunityLinkSchema.shape
	}),
	async ({ id, ...data }) => {
		const record = await communityLinkService.updateCommunityLink(await perms(), id, data);
		void getCommunityLinks().refresh();
		void getCommunityCategories().refresh();
		void getCommunityLink(id).refresh();
		return record;
	}
);

export const deleteCommunityLink = command(z.string().uuid(), async (id) => {
	await communityLinkService.deleteCommunityLink(await perms(), id);
	void getCommunityLinks().refresh();
	void getCommunityCategories().refresh();
});

export const getRoleCommunityLinkIds = query(z.string().uuid(), async (roleId) => {
	await requireAdmin(getRequestEvent());
	return communityLinkService.getRoleCommunityLinkIds(roleId);
});
