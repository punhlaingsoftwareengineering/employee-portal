import { error } from '@sveltejs/kit';
import { E_SIGNATURE_SERVICE_ID } from '$lib/constants/builtin-services';
import { requireAppAccess } from '$lib/server/auth-guard';
import { canAccessService } from '$lib/server/permissions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	await requireAppAccess(event);

	const { availableServices = [] } = await event.parent();
	if (!canAccessService(availableServices, E_SIGNATURE_SERVICE_ID)) {
		error(403, 'Forbidden');
	}

	return {};
};
