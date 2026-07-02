import { getUserPermissions } from '$lib/server/services/portal-user';
import * as communityCategoryService from '$lib/server/services/community-category';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const permissions = locals.user ? await getUserPermissions(locals.user.id) : null;
	const sections = await communityCategoryService.listCommunitySectionsForViewer(permissions);
	return { sections };
};
