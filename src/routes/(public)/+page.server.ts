import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PUBLIC_ROUTES } from '$lib/constants/public-routes';

export const load: PageServerLoad = () => {
	redirect(301, PUBLIC_ROUTES.onboarding);
};
