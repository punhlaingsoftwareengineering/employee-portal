import { command, getRequestEvent } from '$app/server';
import { ORIGIN } from '$app/env/private';
import { error } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { AUTH_ROUTES } from '$lib/constants/auth-routes';
import { auth } from '$lib/server/auth';
import { requireUser } from '$lib/server/auth-guard';

/** Send a password-reset email for the signed-in user (same as forgot-password flow). */
export const requestOwnPasswordReset = command(async () => {
	const event = getRequestEvent();
	const user = requireUser(event);

	try {
		await auth.api.requestPasswordReset({
			body: {
				email: user.email,
				redirectTo: `${ORIGIN}${AUTH_ROUTES.resetPassword}`
			},
			headers: event.request.headers
		});
	} catch (err) {
		if (err instanceof APIError) {
			error(400, err.message || 'Could not send reset email');
		}
		throw err;
	}

	return { ok: true as const };
});
