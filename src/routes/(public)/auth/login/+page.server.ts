import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AUTH_ROUTES } from '$lib/constants/auth-routes';
import { auth } from '$lib/server/auth';
import { redirectIfAuthenticated } from '$lib/server/auth-guest';
import { markOtpSent } from '$lib/server/otp-resend-cooldown';
import { redirectSafe, resolveSafeRedirectTo } from '$lib/server/safe-redirect';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = async (event) => {
	await redirectIfAuthenticated(event);
};

export const actions: Actions = {
	signInEmail: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const redirectTo = resolveSafeRedirectTo(
			formData.get('redirectTo')?.toString() ?? '/dashboard',
			event.url.origin
		);

		try {
			await auth.api.signInEmail({
				body: { email, password, callbackURL: AUTH_ROUTES.verificationSuccess },
				headers: event.request.headers
			});
		} catch (err) {
			if (err instanceof APIError) {
				if (err.message === 'Email not verified') {
					try {
						await auth.api.sendVerificationOTP({
							body: { email, type: 'email-verification' },
							headers: event.request.headers
						});
					} catch {
						// OTP may already exist from sign-in hook
					}

					const otpUrl = new URL(AUTH_ROUTES.otp, event.url.origin);
					otpUrl.searchParams.set('email', email);
					otpUrl.searchParams.set('redirectTo', redirectTo);
					markOtpSent(event.cookies, { secure: event.url.protocol === 'https:' });
					redirect(303, `${otpUrl.pathname}${otpUrl.search}`);
				}

				return fail(400, { message: err.message || 'Sign in failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		redirectSafe(303, redirectTo);
	}
};
