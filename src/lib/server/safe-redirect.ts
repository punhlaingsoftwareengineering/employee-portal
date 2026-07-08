import { DRIVE_ORIGIN, ORIGIN, PORTAL_TRUSTED_REDIRECT_ORIGINS } from '$app/env/private';

function parseTrustedOrigins(): Set<string> {
	const trusted = new Set<string>();
	const portalOrigin = ORIGIN?.trim().replace(/\/$/, '');
	if (portalOrigin) trusted.add(portalOrigin);

	const driveOrigin = DRIVE_ORIGIN?.trim().replace(/\/$/, '');
	if (driveOrigin) trusted.add(driveOrigin);

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
