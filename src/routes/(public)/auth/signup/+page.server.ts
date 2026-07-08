import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AUTH_ROUTES } from '$lib/constants/auth-routes';
import { auth } from '$lib/server/auth';
import { redirectIfAuthenticated } from '$lib/server/auth-guest';
import { resolveSafeRedirectTo } from '$lib/server/safe-redirect';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = async (event) => {
	await redirectIfAuthenticated(event);
};

export const actions: Actions = {
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';
		const redirectTo = resolveSafeRedirectTo(
			formData.get('redirectTo')?.toString() ?? '/dashboard',
			event.url.origin
		);

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match' });
		}

		try {
			await auth.api.signUpEmail({
				body: { email, password, name, callbackURL: AUTH_ROUTES.verificationSuccess },
				headers: event.request.headers
			});
		} catch (err) {
			if (err instanceof APIError) {
				return fail(400, { message: err.message || 'Registration failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		const otpUrl = new URL(AUTH_ROUTES.otp, event.url.origin);
		otpUrl.searchParams.set('email', email);
		otpUrl.searchParams.set('redirectTo', redirectTo);
		redirect(303, `${otpUrl.pathname}${otpUrl.search}`);
	}
};
