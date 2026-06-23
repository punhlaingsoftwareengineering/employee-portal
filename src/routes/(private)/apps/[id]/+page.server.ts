import { error } from '@sveltejs/kit';
import { getUserPermissions } from '$lib/server/services/portal-user';
import { getAppForUser } from '$lib/server/services/app';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const permissions = await getUserPermissions(locals.user.id);
	const app = await getAppForUser(permissions, params.id);

	return { app };
};
