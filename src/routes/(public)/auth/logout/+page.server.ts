import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { AUTH_ROUTES } from '$lib/constants/auth-routes';
import { auth } from '$lib/server/auth';

export const actions: Actions = {
	default: async (event) => {
		await auth.api.signOut({ headers: event.request.headers });
		redirect(303, AUTH_ROUTES.login);
	}
};
