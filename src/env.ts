import { defineEnvVars } from '@sveltejs/kit/hooks';
import { z } from 'zod';

const optionalString = z.string().optional();

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'The database connection string.' },
	AUTH_DATABASE_URL: {
		description:
			'Shared Better Auth database (user, session, account, verification). Defaults to DATABASE_URL when unset.',
		schema: optionalString
	},
	AUTH_COOKIE_DOMAIN: {
		description:
			'Parent cookie domain for cross-subdomain SSO (e.g. `.phh.com` or `.local.test`). Unset = host-only cookies.',
		schema: optionalString
	},
	PORTAL_TRUSTED_REDIRECT_ORIGINS: {
		description:
			'Comma-separated origins allowed for post-login redirectTo. Defaults to DRIVE_ORIGIN when unset.',
		schema: optionalString
	},
	DRIVE_ORIGIN: {
		description:
			'PHH-DRIVE public URL (e.g. `https://office.drive.phh.com` or `http://drive.local.test`). Used for SSO redirects and Caddy.',
		schema: optionalString
	},
	DRIVE_INTERNAL_ORIGIN: {
		description:
			'PHH-DRIVE URL for server-side API calls (e.g. `http://host.docker.internal:1025` or `http://phh-drive:1025`). Falls back to DRIVE_ORIGIN when unset.',
		schema: optionalString
	},
	DOCS_ORIGIN: {
		description:
			'Documentation site public URL (e.g. `https://docs.phh.com` or `http://docs.local.test`). Used for SSO redirects and Caddy.',
		schema: optionalString
	},
	ORDER_RESEND_ORIGIN: {
		description:
			'OmegaAi Order Resend public URL (e.g. `https://order-resend.office.phh.com` or `http://order-resend.local.test`). Used for SSO redirects and Caddy.',
		schema: optionalString
	},
	MARI_CHATBOT_ORIGIN: {
		description:
			'Mari Chatbot public URL (e.g. `http://chatbot.n8n.phh.com` or `http://mari.local.test`). Used for SSO redirects and Tools tile link.',
		schema: optionalString
	},
	N8N_MONITOR_ORIGIN: {
		description:
			'n8n Monitor public URL (e.g. `http://monitor.n8n.phh.com`). Used for SSO redirects and Tools tile link.',
		schema: optionalString
	},
	CALLTRACKER_ORIGIN: {
		description:
			'3CX Call Tracker public URL (e.g. `http://dashboard.routetracker.phh.com`). Used for SSO redirects and Tools tile link.',
		schema: optionalString
	},
	DRIVE_TEAM_API_KEY: {
		description:
			'Team-scoped PHH-DRIVE API key (`znltv_…`) for server-side portal media uploads. Never expose to the browser.',
		schema: optionalString
	},
	DRIVE_STORAGE_PROVIDER: {
		description: 'Storage provider for portal media uploads (`local` or `tigris`). Default: `local`.',
		schema: optionalString
	},
	ORIGIN: {
		description:
			'Portal public URL (e.g. `https://phh.com` or `http://portal.local.test`). Must match the browser address.'
	},
	BETTER_AUTH_SECRET: {
		description:
			'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).'
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
