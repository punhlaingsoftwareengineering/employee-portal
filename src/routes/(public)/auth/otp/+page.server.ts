import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { OTP_RESEND_COOLDOWN_SECONDS } from '$lib/constants/auth-otp';
import { auth } from '$lib/server/auth';
import {
	getOtpResendAvailableAt,
	getOtpResendRemainingSeconds,
	markOtpSent
} from '$lib/server/otp-resend-cooldown';
import { redirectSafe, resolveSafeRedirectTo } from '$lib/server/safe-redirect';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = ({ url, cookies }) => {
	const email = url.searchParams.get('email') ?? '';
	const redirectTo = resolveSafeRedirectTo(
		url.searchParams.get('redirectTo') ?? '/dashboard',
		url.origin
	);

	return {
		email,
		redirectTo,
		resendAvailableAt: getOtpResendAvailableAt(cookies)
	};
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

		redirectSafe(303, redirectTo);
	},
	resend: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';

		if (!email) {
			return fail(400, { message: 'Email is required' });
		}

		const remaining = getOtpResendRemainingSeconds(event.cookies);
		if (remaining > 0) {
			return fail(429, {
				message: `Please wait ${remaining}s before requesting another code.`,
				resendAvailableAt: getOtpResendAvailableAt(event.cookies)
			});
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

		const resendAvailableAt = markOtpSent(event.cookies, {
			secure: event.url.protocol === 'https:'
		});

		return {
			resent: true,
			resendAvailableAt,
			cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS
		};
	}
};
