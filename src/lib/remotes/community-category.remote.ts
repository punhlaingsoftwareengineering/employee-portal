import { command, query } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as communityCategoryService from '$lib/server/services/community-category';
import {
	createCommunityCategorySchema,
	updateCommunityCategorySchema
} from '$lib/schemas/community-category';
import { requireCommunityManage } from '$lib/server/auth-guard';

async function perms() {
	return requireCommunityManage(getRequestEvent());
}

export const getCommunityCategories = query(async () =>
	communityCategoryService.listCommunityCategories(await perms())
);

export const getCommunityCategory = query(z.string().uuid(), async (id) =>
	communityCategoryService.getCommunityCategory(await perms(), id)
);

export const createCommunityCategory = command(createCommunityCategorySchema, async (data) => {
	const record = await communityCategoryService.createCommunityCategory(await perms(), data);
	void getCommunityCategories().refresh();
	return record;
});

export const updateCommunityCategory = command(
	z.object({
		id: z.string().uuid(),
		...updateCommunityCategorySchema.shape
	}),
	async ({ id, ...data }) => {
		const record = await communityCategoryService.updateCommunityCategory(await perms(), id, data);
		void getCommunityCategories().refresh();
		void getCommunityCategory(id).refresh();
		return record;
	}
);

export const deleteCommunityCategory = command(z.string().uuid(), async (id) => {
	await communityCategoryService.deleteCommunityCategory(await perms(), id);
	void getCommunityCategories().refresh();
});
