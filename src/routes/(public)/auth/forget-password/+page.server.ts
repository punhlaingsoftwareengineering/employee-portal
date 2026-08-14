import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { redirectIfAuthenticated } from '$lib/server/auth-guest';
import { requestPasswordResetEmail } from '$lib/server/services/password-reset';

export const load: PageServerLoad = async (event) => {
	await redirectIfAuthenticated(event);
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';

		try {
			await requestPasswordResetEmail(email);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : 'Could not send reset email. Check server mail logs.';
			console.error('[forget-password] requestPasswordResetEmail failed', err);
			return fail(500, { message });
		}

		return { success: true };
	}
};
