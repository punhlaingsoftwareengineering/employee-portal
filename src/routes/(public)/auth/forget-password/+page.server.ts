import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ORIGIN } from '$app/env/private';
import { AUTH_ROUTES } from '$lib/constants/auth-routes';
import { auth } from '$lib/server/auth';
import { redirectIfAuthenticated } from '$lib/server/auth-guest';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = async (event) => {
	await redirectIfAuthenticated(event);
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';

		try {
			await auth.api.requestPasswordReset({
				body: {
					email,
					redirectTo: `${ORIGIN}${AUTH_ROUTES.resetPassword}`
				},
				headers: event.request.headers
			});
		} catch (err) {
			if (err instanceof APIError) {
				return fail(400, { message: err.message || 'Could not send reset email' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return { success: true };
	}
};
