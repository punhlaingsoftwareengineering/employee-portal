import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AUTH_ROUTES } from '$lib/constants/auth-routes';

export const load: PageServerLoad = ({ url }) => {
	redirect(301, `${AUTH_ROUTES.login}${url.search}`);
};
