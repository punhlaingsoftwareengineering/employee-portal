import {
	DOCS_ORIGIN,
	DRIVE_ORIGIN,
	N8N_CHATBOT_ORIGIN,
	N8N_MONITOR_ORIGIN,
	OAI_ORDER_SENDER_ORIGIN,
	ORIGIN,
	PHH_CALLTRACKER_DASHBOARD_ORIGIN,
	PORTAL_TRUSTED_REDIRECT_ORIGINS
} from '$app/env/private';

function normalizeOrigin(value: string): string {
	return value.trim().replace(/\/$/, '');
}

/** Include http + https for the same host so proxy/TLS mismatches do not break auth. */
function withSchemeAlternate(origin: string): string[] {
	try {
		const url = new URL(origin);
		const alternate =
			url.protocol === 'https:' ? `http://${url.host}` : `https://${url.host}`;
		return [url.origin, alternate];
	} catch {
		return [];
	}
}

function addOrigin(trusted: Set<string>, value: string | undefined) {
	if (!value?.trim()) return;

	const normalized = normalizeOrigin(value);
	if (!normalized.startsWith('http')) return;

	for (const origin of withSchemeAlternate(normalized)) {
		trusted.add(origin);
	}
}

function addOriginsList(trusted: Set<string>, raw: string | undefined) {
	if (!raw?.trim()) return;

	for (const part of raw.split(',')) {
		addOrigin(trusted, part);
	}
}

/** Origins allowed for Better Auth CSRF checks and post-login redirects. */
export function getAuthTrustedOrigins(): string[] {
	const trusted = new Set<string>();

	addOrigin(trusted, ORIGIN);
	addOrigin(trusted, DRIVE_ORIGIN);
	addOrigin(trusted, DOCS_ORIGIN);
	addOrigin(trusted, OAI_ORDER_SENDER_ORIGIN);
	addOrigin(trusted, N8N_CHATBOT_ORIGIN);
	addOrigin(trusted, N8N_MONITOR_ORIGIN);
	addOrigin(trusted, PHH_CALLTRACKER_DASHBOARD_ORIGIN);
	addOriginsList(trusted, PORTAL_TRUSTED_REDIRECT_ORIGINS);

	return [...trusted];
}
