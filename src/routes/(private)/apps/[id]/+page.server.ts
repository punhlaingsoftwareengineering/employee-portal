import { requireToolsAccess } from '$lib/server/auth-guard';
import { getAppForUser } from '$lib/server/services/app';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const perms = await requireToolsAccess(event);
	const app = await getAppForUser(perms, event.params.id);

	return { app };
};
