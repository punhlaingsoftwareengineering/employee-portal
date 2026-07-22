import { redirect } from '@sveltejs/kit';
import { requireToolsAccess } from '$lib/server/auth-guard';
import { canAccessService } from '$lib/server/permissions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	await requireToolsAccess(event);

	const { params, parent } = event;
	const { availableServices = [] } = await parent();

	if (!canAccessService(availableServices, params.id)) {
		redirect(303, '/dashboard');
	}

	const service = availableServices.find((item) => item.id === params.id);
	if (!service) {
		redirect(303, '/dashboard');
	}

	redirect(303, service.link);
};
