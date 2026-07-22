import { requireSettingsAccess } from '$lib/server/auth-guard';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	await requireSettingsAccess(event);
	return {};
};
