import * as toolGuideService from '$lib/server/services/tool-guide';
import * as toolLearningService from '$lib/server/services/tool-learning';
import type { UserPermissions } from '$lib/server/permissions';
import type { PageServerLoad } from './$types';

const publicListPerms = {
	userId: '',
	portalRole: 'guest',
	isAdmin: false,
	isGuest: true,
	departmentRoles: []
} satisfies UserPermissions;

export const load: PageServerLoad = async () => {
	const [guides, learnings] = await Promise.all([
		toolGuideService.listToolGuides(publicListPerms),
		toolLearningService.listToolLearnings(publicListPerms)
	]);

	return { guides, learnings };
};
