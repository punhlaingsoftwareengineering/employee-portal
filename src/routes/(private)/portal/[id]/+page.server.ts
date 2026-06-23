import { redirect } from '@sveltejs/kit';
import { canAccessService } from '$lib/server/permissions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
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
