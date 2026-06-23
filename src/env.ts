import { defineEnvVars } from '@sveltejs/kit/hooks';
import { z } from 'zod';

const optionalString = z.string().optional();

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'The database connection string.' },
	ORIGIN: {
		description: 'The app origin (base URL), e.g. `http://localhost:1027`.'
	},
	BETTER_AUTH_SECRET: {
		description:
			'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).'
	},
	GITHUB_CLIENT_ID: {
		description:
			'GitHub OAuth client ID. See [Better Auth GitHub provider](https://www.better-auth.com/docs/authentication/github).',
		schema: optionalString
	},
	GITHUB_CLIENT_SECRET: {
		description:
			'GitHub OAuth client secret. See [Better Auth GitHub provider](https://www.better-auth.com/docs/authentication/github).',
		schema: optionalString
	},
	SMTP_HOST: {
		description: 'SMTP server host for auth emails (OTP, verification).',
		schema: optionalString
	},
	SMTP_PORT: {
		description: 'SMTP server port (587 or 465).',
		schema: optionalString
	},
	SMTP_USER: {
		description: 'SMTP username / mailbox address.',
		schema: optionalString
	},
	SMTP_PASS: {
		description: 'SMTP password or app password.',
		schema: optionalString
	},
	SMTP_FROM: {
		description: 'From address for outgoing auth emails.',
		schema: optionalString
	},
	AUTH_SESSION_EXPIRES_IN: {
		description:
			'Max session lifetime (e.g. `7d`, `12h`, or seconds). Default: `7d`. See Better Auth session config.',
		schema: optionalString
	},
	AUTH_SESSION_UPDATE_AGE: {
		description:
			'Extend session expiry when active (e.g. `1d`, `12h`). Default: `1d`. See Better Auth session config.',
		schema: optionalString
	},
	AUTH_SESSION_COOKIE_CACHE_ENABLED: {
		description: 'Cache session in cookie for faster getSession. Default: `true`.',
		schema: optionalString
	},
	AUTH_SESSION_COOKIE_CACHE_MAX_AGE: {
		description: 'Cookie session cache TTL (e.g. `5m`, `300`). Default: `5m`.',
		schema: optionalString
	},
	AUTH_SESSION_SECURE_COOKIES: {
		description:
			'Force Secure session cookies (`true`/`false`). Unset = auto from ORIGIN (https → secure).',
		schema: optionalString
	}
});
