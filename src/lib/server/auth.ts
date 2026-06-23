import {
	ORIGIN,
	BETTER_AUTH_SECRET,
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET
} from '$app/env/private';

import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { sendVerificationOtpEmail } from '$lib/server/mail';
import {
	countUsers,
	createUserProfile,
	findValidPendingInviteByEmail
} from '$lib/server/services/portal-user';
import { getAuthSessionOptions } from '$lib/server/auth-session-config';

const { session, advanced } = getAuthSessionOptions();

const github =
	GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET
		? {
				github: {
					clientId: GITHUB_CLIENT_ID,
					clientSecret: GITHUB_CLIENT_SECRET
				}
			}
		: undefined;

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	session,
	advanced,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		autoSignIn: false
	},
	emailVerification: {
		autoSignInAfterVerification: true,
		sendOnSignIn: true
	},
	socialProviders: github,
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
