import { ORIGIN, BETTER_AUTH_SECRET } from '$app/env/private';

import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { authDb } from '$lib/server/db/auth-db';
import { sendPasswordResetEmail, sendVerificationOtpEmail } from '$lib/server/mail';
import {
	countUsers,
	createUserProfile,
	findValidPendingInviteByEmail
} from '$lib/server/services/portal-user';
import { getAuthSessionOptions } from '$lib/server/auth-session-config';
import { getAuthTrustedOrigins } from '$lib/server/auth-trusted-origins';

const { session, advanced } = getAuthSessionOptions();

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	trustedOrigins: getAuthTrustedOrigins(),
	database: drizzleAdapter(authDb, { provider: 'pg' }),
	session,
	advanced,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		autoSignIn: false,
		sendResetPassword: async ({ user, url }) => {
			sendPasswordResetEmail({ email: user.email, url });
		}
	},
	emailVerification: {
		autoSignInAfterVerification: true,
		sendOnSignIn: true
	},
	databaseHooks: {
		user: {
			create: {
				after: async (createdUser) => {
					const invite = await findValidPendingInviteByEmail(createdUser.email);
					if (invite) {
						await createUserProfile(createdUser.id, invite.portalRole);
						return;
					}

					const totalUsers = await countUsers();
					await createUserProfile(createdUser.id, totalUsers === 1 ? 'admin' : 'guest');
				}
			}
		}
	},
	plugins: [
		emailOTP({
			sendVerificationOnSignUp: true,
			overrideDefaultEmailVerification: true,
			async sendVerificationOTP({ email, otp, type }) {
				await sendVerificationOtpEmail({ email, otp, type });
			}
		}),
		sveltekitCookies(getRequestEvent)
	]
});
