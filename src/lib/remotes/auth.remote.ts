import { command, getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth-guard';
import { requestPasswordResetEmail } from '$lib/server/services/password-reset';

/** Send a password-reset email for the signed-in user (same as forgot-password flow). */
export const requestOwnPasswordReset = command(async () => {
	const event = getRequestEvent();
	const user = requireUser(event);

	try {
		await requestPasswordResetEmail(user.email);
	} catch (err) {
		console.error('[requestOwnPasswordReset] failed', err);
		const message =
			err instanceof Error ? err.message : 'Could not send reset email. Check server mail logs.';
		error(500, message);
	}

	return { ok: true as const };
});
