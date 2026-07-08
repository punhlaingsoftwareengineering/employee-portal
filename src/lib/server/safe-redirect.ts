import { redirect } from '@sveltejs/kit';
import { DOCS_ORIGIN, DRIVE_ORIGIN, ORIGIN, PORTAL_TRUSTED_REDIRECT_ORIGINS } from '$app/env/private';

function parseTrustedOrigins(): Set<string> {
	const trusted = new Set<string>();
	const portalOrigin = ORIGIN?.trim().replace(/\/$/, '');
	if (portalOrigin) trusted.add(portalOrigin);

	const driveOrigin = DRIVE_ORIGIN?.trim().replace(/\/$/, '');
	if (driveOrigin) trusted.add(driveOrigin);

	const docsOrigin = DOCS_ORIGIN?.trim().replace(/\/$/, '');
	if (docsOrigin) trusted.add(docsOrigin);

	const raw = PORTAL_TRUSTED_REDIRECT_ORIGINS?.trim();
	if (raw) {
		for (const part of raw.split(',')) {
			const o = part.trim().replace(/\/$/, '');
			if (o) trusted.add(o);
		}
	}
	return trusted;
}

const trustedOrigins = parseTrustedOrigins();

/** Safe redirect target after login: same portal path or allowlisted external origin. */
export function resolveSafeRedirectTo(redirectTo: string, portalOrigin: string): string {
	const trimmed = redirectTo.trim();
	if (!trimmed) return '/dashboard';

	if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
		return trimmed;
	}

	try {
		const url = new URL(trimmed);
		const normalized = url.origin;
		if (trustedOrigins.has(normalized)) {
			return url.toString();
		}
	} catch {
		// fall through
	}

	void portalOrigin;
	return '/dashboard';
}

function isExternalLocation(location: string): boolean {
	return /^https?:\/\//i.test(location);
}

/** Redirect after auth; passes SvelteKit external allowlist for SSO targets (drive, docs). */
export function redirectSafe(
	status: 301 | 302 | 303 | 307 | 308,
	location: string
): never {
	if (isExternalLocation(location)) {
		redirect(status, location, { external: [...trustedOrigins] });
	}
	redirect(status, location);
}
