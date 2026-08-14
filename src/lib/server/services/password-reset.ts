import { ORIGIN } from '$app/env/private';
import { generateId } from 'better-auth';
import { AUTH_ROUTES } from '$lib/constants/auth-routes';
import { auth } from '$lib/server/auth';
import { sendPasswordResetEmail } from '$lib/server/mail';

const RESET_TOKEN_TTL_SEC = 60 * 60;

/**
 * Request a password-reset email.
 *
 * Better Auth's `requestPasswordReset` swallows errors from `sendResetPassword`
 * (`runInBackgroundOrAwait` catches and only logs). We drive the same token + URL
 * shape ourselves so SMTP failures surface to the caller.
 */
export async function requestPasswordResetEmail(email: string): Promise<void> {
	const normalized = email.trim().toLowerCase();
	if (!normalized) {
		throw new Error('Email is required');
	}

	const ctx = await auth.$context;
	const user = await ctx.internalAdapter.findUserByEmail(normalized, { includeAccounts: true });

	if (!user) {
		// Match Better Auth: do not reveal whether the account exists.
		await ctx.internalAdapter.findVerificationValue('dummy-verification-token');
		return;
	}

	const verificationToken = generateId(24);
	const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_SEC * 1000);

	await ctx.internalAdapter.createVerificationValue({
		value: user.user.id,
		identifier: `reset-password:${verificationToken}`,
		expiresAt
	});

	const redirectTo = `${ORIGIN}${AUTH_ROUTES.resetPassword}`;
	const url = `${ctx.baseURL}/reset-password/${verificationToken}?callbackURL=${encodeURIComponent(redirectTo)}`;

	await sendPasswordResetEmail({ email: user.user.email, url });
}
