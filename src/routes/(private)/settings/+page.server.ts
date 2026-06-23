import { error } from '@sveltejs/kit';
import { requireAppAccess } from '$lib/server/auth-guard';
import { canAccessSettings } from '$lib/server/permissions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const perms = await requireAppAccess(event);
	if (!canAccessSettings(perms)) error(403, 'Forbidden');
	return {};
};
