import { defineEnvVars } from '@sveltejs/kit/hooks';

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
		optional: true
	},
	GITHUB_CLIENT_SECRET: {
		description:
			'GitHub OAuth client secret. See [Better Auth GitHub provider](https://www.better-auth.com/docs/authentication/github).',
		optional: true
	},
	SMTP_HOST: {
		description: 'SMTP server host for auth emails (OTP, verification).',
		optional: true
	},
	SMTP_PORT: {
		description: 'SMTP server port (587 or 465).',
		optional: true
	},
	SMTP_USER: {
		description: 'SMTP username / mailbox address.',
		optional: true
	},
	SMTP_PASS: {
		description: 'SMTP password or app password.',
		optional: true
	},
	SMTP_FROM: {
		description: 'From address for outgoing auth emails.',
		optional: true
	},
	AUTH_SESSION_EXPIRES_IN: {
		description:
			'Max session lifetime (e.g. `7d`, `12h`, or seconds). Default: `7d`. See Better Auth session config.',
		optional: true
	},
	AUTH_SESSION_UPDATE_AGE: {
		description:
			'Extend session expiry when active (e.g. `1d`, `12h`). Default: `1d`. See Better Auth session config.',
		optional: true
	},
	AUTH_SESSION_COOKIE_CACHE_ENABLED: {
		description: 'Cache session in cookie for faster getSession. Default: `true`.',
		optional: true
	},
	AUTH_SESSION_COOKIE_CACHE_MAX_AGE: {
		description: 'Cookie session cache TTL (e.g. `5m`, `300`). Default: `5m`.',
		optional: true
	},
	AUTH_SESSION_SECURE_COOKIES: {
		description:
			'Force Secure session cookies (`true`/`false`). Unset = auto from ORIGIN (https → secure).',
		optional: true
	}
});
