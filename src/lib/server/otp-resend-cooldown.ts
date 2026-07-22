import type { Cookies } from '@sveltejs/kit';
import {
	OTP_RESEND_COOKIE,
	OTP_RESEND_COOLDOWN_SECONDS
} from '$lib/constants/auth-otp';

export function getOtpResendAvailableAt(cookies: Cookies): number | null {
	const raw = cookies.get(OTP_RESEND_COOKIE);
	if (!raw) return null;
	const value = Number(raw);
	return Number.isFinite(value) ? value : null;
}

export function getOtpResendRemainingSeconds(cookies: Cookies, now = Date.now()): number {
	const availableAt = getOtpResendAvailableAt(cookies);
	if (availableAt == null) return 0;
	return Math.max(0, Math.ceil((availableAt - now) / 1000));
}

export function markOtpSent(
	cookies: Cookies,
	options: { secure?: boolean } = {},
	now = Date.now()
): number {
	const availableAt = now + OTP_RESEND_COOLDOWN_SECONDS * 1000;
	cookies.set(OTP_RESEND_COOKIE, String(availableAt), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: OTP_RESEND_COOLDOWN_SECONDS,
		secure: options.secure ?? false
	});
	return availableAt;
}
