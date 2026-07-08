import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { resolveSafeRedirectTo } from '$lib/server/safe-redirect';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = ({ url }) => {
	const email = url.searchParams.get('email') ?? '';
	const redirectTo = resolveSafeRedirectTo(
		url.searchParams.get('redirectTo') ?? '/dashboard',
		url.origin
	);

	return { email, redirectTo };
};

export const actions: Actions = {
	verify: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const otp = formData.get('otp')?.toString() ?? '';
		const redirectTo = resolveSafeRedirectTo(
			formData.get('redirectTo')?.toString() ?? '/dashboard',
			event.url.origin
		);

		try {
			await auth.api.verifyEmailOTP({
				body: { email, otp },
				headers: event.request.headers
			});
		} catch (err) {
			if (err instanceof APIError) {
				return fail(400, { message: err.message || 'Invalid verification code' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		redirect(303, redirectTo);
	},
	resend: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';

		if (!email) {
			return fail(400, { message: 'Email is required' });
		}

		try {
			await auth.api.sendVerificationOTP({
				body: { email, type: 'email-verification' },
				headers: event.request.headers
			});
		} catch (err) {
			if (err instanceof APIError) {
				return fail(400, { message: err.message || 'Could not resend code' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		return { resent: true };
	}
};
